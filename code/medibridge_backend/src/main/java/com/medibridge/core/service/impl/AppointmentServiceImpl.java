package com.medibridge.core.service.impl;

import com.medibridge.core.dto.AppointmentRequestDTO;
import com.medibridge.core.dto.AppointmentResponseDTO;
import com.medibridge.core.exception.ResourceNotFoundException;
import com.medibridge.core.model.Appointment;
import com.medibridge.core.model.Doctor;
import com.medibridge.core.model.Patient;
import com.medibridge.core.repository.AppointmentRepository;
import com.medibridge.core.repository.DoctorRepository;
import com.medibridge.core.repository.PatientRepository;
import com.medibridge.core.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final com.medibridge.core.service.GoogleCalendarService googleCalendarService;
    private final com.medibridge.core.service.KafkaProducerService kafkaProducerService;

    @Override
    @Transactional
    public AppointmentResponseDTO bookAppointment(Integer patientId, AppointmentRequestDTO request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .build();
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setReason(request.getReason());
        appointment.setDescription(request.getDescription());
        
        // Determine if it is a follow-up
        boolean isFollowUp = appointmentRepository.existsByPatient_PatientIdAndDoctor_DoctorIdAndReasonIgnoreCase(
                patientId, request.getDoctorId(), request.getReason());
        
        appointment.setAppointmentType(isFollowUp ? "Follow-up" : "Consultation");
        if (request.getAttachedFiles() != null && !request.getAttachedFiles().isEmpty()) {
            appointment.setAttachedFiles(new java.util.ArrayList<>(request.getAttachedFiles()));
        }
        appointment.setStatus(Appointment.Status.Pending);

        Appointment saved = appointmentRepository.save(appointment);
        
        kafkaProducerService.publishAppointmentEvent(
            com.medibridge.core.dto.AppointmentEventDTO.builder()
                .appointmentId(saved.getAppointmentId())
                .patientName(saved.getPatient().getFullName())
                .doctorName(saved.getDoctor().getFullName())
                .status(saved.getStatus().name())
                .timestamp(java.time.Instant.now().toString())
                .build()
        );
        
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public AppointmentResponseDTO updateAppointmentStatus(Integer appointmentId, Appointment.Status status, String doctorId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        // Basic authorization check
        if (!appointment.getDoctor().getDoctorId().equals(doctorId)) {
            throw new IllegalArgumentException("Doctor is not authorized to update this appointment");
        }

        appointment.setStatus(status);
        
        if (status == Appointment.Status.Confirmed) {
            String meetLink = googleCalendarService.createMeetLink(appointment);
            if (meetLink != null) {
                appointment.setMeetLink(meetLink);
            }
        }
        
        // If doctor suggests a reschedule, update the flag (based on frontend logic)
        if (status == Appointment.Status.Suggested) {
            appointment.setIsRescheduled(true);
        }

        Appointment updated = appointmentRepository.save(appointment);
        
        kafkaProducerService.publishAppointmentEvent(
            com.medibridge.core.dto.AppointmentEventDTO.builder()
                .appointmentId(updated.getAppointmentId())
                .patientName(updated.getPatient().getFullName())
                .doctorName(updated.getDoctor().getFullName())
                .status(updated.getStatus().name())
                .timestamp(java.time.Instant.now().toString())
                .build()
        );
        
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public AppointmentResponseDTO doctorRescheduleAppointment(Integer appointmentId, String doctorId, com.medibridge.core.dto.RescheduleRequestDTO request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        if (!appointment.getDoctor().getDoctorId().equals(doctorId)) {
            throw new IllegalArgumentException("Unauthorized to modify this appointment");
        }

        try {
            appointment.setAppointmentDate(java.time.LocalDateTime.of(
                    java.time.LocalDate.parse(request.getNewDate()),
                    java.time.LocalTime.parse(request.getNewTime(), java.time.format.DateTimeFormatter.ofPattern("hh:mm a"))
            ));
        } catch (Exception e) {
            // fallback if format is HH:mm
            try {
                appointment.setAppointmentDate(java.time.LocalDateTime.of(
                        java.time.LocalDate.parse(request.getNewDate()),
                        java.time.LocalTime.parse(request.getNewTime(), java.time.format.DateTimeFormatter.ofPattern("HH:mm"))
                ));
            } catch (Exception ex) {
                // If parsing fails, just leave the date as is but set the reason
            }
        }
        
        appointment.setStatus(Appointment.Status.Suggested);
        appointment.setIsRescheduled(true);
        if (request.getReason() != null) {
            appointment.setReason(request.getReason());
        }
        
        appointment = appointmentRepository.save(appointment);
        return mapToDTO(appointment);
    }

    @Override
    @Transactional
    public AppointmentResponseDTO patientRespondToReschedule(Integer appointmentId, Integer patientId, boolean accepted) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        if (!appointment.getPatient().getPatientId().equals(patientId)) {
            throw new IllegalArgumentException("Unauthorized to modify this appointment");
        }

        if (accepted) {
            appointment.setStatus(Appointment.Status.Confirmed);
            String meetLink = googleCalendarService.createMeetLink(appointment);
            if (meetLink != null) {
                appointment.setMeetLink(meetLink);
            }
        } else {
            appointment.setStatus(Appointment.Status.Cancelled);
        }
        
        appointment = appointmentRepository.save(appointment);
        return mapToDTO(appointment);
    }

    @Override
    @Transactional
    public AppointmentResponseDTO patientRescheduleAppointment(Integer appointmentId, Integer patientId, com.medibridge.core.dto.RescheduleRequestDTO request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        if (!appointment.getPatient().getPatientId().equals(patientId)) {
            throw new IllegalArgumentException("Unauthorized to modify this appointment");
        }

        try {
            appointment.setAppointmentDate(java.time.LocalDateTime.of(
                    java.time.LocalDate.parse(request.getNewDate()),
                    java.time.LocalTime.parse(request.getNewTime(), java.time.format.DateTimeFormatter.ofPattern("hh:mm a"))
            ));
        } catch (Exception e) {
            try {
                appointment.setAppointmentDate(java.time.LocalDateTime.of(
                        java.time.LocalDate.parse(request.getNewDate()),
                        java.time.LocalTime.parse(request.getNewTime(), java.time.format.DateTimeFormatter.ofPattern("HH:mm"))
                ));
            } catch (Exception ex) {
            }
        }
        
        // When patient reschedules, status goes back to Pending and it's marked as rescheduled
        appointment.setStatus(Appointment.Status.Pending);
        appointment.setIsRescheduled(true);
        if (request.getReason() != null) {
            appointment.setReason(request.getReason());
        }
        
        appointment = appointmentRepository.save(appointment);
        return mapToDTO(appointment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponseDTO> getPatientAppointments(Integer patientId) {
        return appointmentRepository.findByPatient_PatientIdOrderByAppointmentDateDesc(patientId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponseDTO> getDoctorAppointments(String doctorId) {
        return appointmentRepository.findByDoctor_DoctorIdOrderByAppointmentDateDesc(doctorId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AppointmentResponseDTO cancelAppointment(Integer appointmentId, Integer patientId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        
        if (!appointment.getPatient().getPatientId().equals(patientId)) {
            throw new IllegalArgumentException("Patient is not authorized to cancel this appointment");
        }
        
        appointment.setStatus(Appointment.Status.Cancelled);
        return mapToDTO(appointmentRepository.save(appointment));
    }

    // Helper method to map Entity to Response DTO
    @Override
    @Transactional
    public AppointmentResponseDTO updatePrescriptions(Integer appointmentId, String doctorId, java.util.List<String> prescriptions) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
        if (!appointment.getDoctor().getDoctorId().equals(doctorId)) {
            throw new IllegalArgumentException("Unauthorized to modify this appointment");
        }
        if (prescriptions != null) {
            appointment.getPrescriptions().clear();
            appointment.getPrescriptions().addAll(prescriptions);
        }
        appointment = appointmentRepository.save(appointment);
        return mapToDTO(appointment);
    }

    @Override
    @Transactional
    public AppointmentResponseDTO rateAppointment(Integer appointmentId, Integer patientId, com.medibridge.core.dto.RateRequestDTO request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
        if (!appointment.getPatient().getPatientId().equals(patientId)) {
            throw new IllegalArgumentException("Unauthorized to rate this appointment");
        }
        if (appointment.getStatus() != Appointment.Status.Completed) {
            throw new IllegalArgumentException("Only completed appointments can be rated");
        }
        if (appointment.getIsRated() != null && appointment.getIsRated()) {
            throw new IllegalArgumentException("Appointment has already been rated");
        }

        // Calculate new rating
        Doctor doctor = appointment.getDoctor();
        int count = doctor.getRatingCount() != null ? doctor.getRatingCount() : 0;
        java.math.BigDecimal currentRating = doctor.getRating() != null ? doctor.getRating() : java.math.BigDecimal.ZERO;
        
        java.math.BigDecimal newRating = currentRating.multiply(java.math.BigDecimal.valueOf(count))
                .add(java.math.BigDecimal.valueOf(request.getScore()))
                .divide(java.math.BigDecimal.valueOf(count + 1), 1, java.math.RoundingMode.HALF_UP);
        
        doctor.setRating(newRating);
        doctor.setRatingCount(count + 1);
        doctorRepository.save(doctor); // Update the doctor's overall rating

        appointment.setIsRated(true);
        appointment = appointmentRepository.save(appointment);

        return mapToDTO(appointment);
    }

    private AppointmentResponseDTO mapToDTO(Appointment appointment) {
        int age = appointment.getPatient().getDateOfBirth() != null ? 
                  java.time.Period.between(appointment.getPatient().getDateOfBirth(), java.time.LocalDate.now()).getYears() : 0;
                  
        return AppointmentResponseDTO.builder()
                .appointmentId(appointment.getAppointmentId())
                .doctorName(appointment.getDoctor().getFullName())
                .doctorSpecialization(appointment.getDoctor().getSpecialization())
                .patientId(appointment.getPatient().getPatientId())
                .patientName(appointment.getPatient().getFullName())
                .patientAge(age)
                .patientBloodGroup(appointment.getPatient().getBloodGroup())
                .patientGender(appointment.getPatient().getGender() != null ? appointment.getPatient().getGender().name() : null)
                .appointmentDate(appointment.getAppointmentDate())
                .type(appointment.getAppointmentType())
                .status(appointment.getStatus())
                .reason(appointment.getReason())
                .description(appointment.getDescription())
                .isRescheduled(appointment.getIsRescheduled())
                .attachedFiles(appointment.getAttachedFiles() != null ? new java.util.ArrayList<>(appointment.getAttachedFiles()) : new java.util.ArrayList<>())
                .prescriptions(appointment.getPrescriptions() != null ? new java.util.ArrayList<>(appointment.getPrescriptions()) : new java.util.ArrayList<>())
                .isRated(appointment.getIsRated())
                .meetLink(appointment.getMeetLink())
                .build();
    }
}
