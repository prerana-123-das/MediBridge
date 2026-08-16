package com.medibridge.core.service.impl;

import com.medibridge.core.dto.AvailabilityDTO;
import com.medibridge.core.exception.ResourceNotFoundException;
import com.medibridge.core.model.Doctor;
import com.medibridge.core.model.DoctorWeeklyAvailability;
import com.medibridge.core.repository.DoctorRepository;
import com.medibridge.core.repository.DoctorWeeklyAvailabilityRepository;
import com.medibridge.core.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final DoctorWeeklyAvailabilityRepository availabilityRepository;
    private final com.medibridge.core.repository.AppointmentRepository appointmentRepository;

    @Override
    @Transactional(readOnly = true)
    public Doctor getDoctorById(String doctorId) {
        return doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Doctor> getAvailableDoctors() {
        // Simple fetch for active doctors, can be expanded to filter by specific availability
        return doctorRepository.findAll().stream()
                .filter(d -> d.getStatus() != Doctor.Status.suspended && d.getAvailable())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Doctor updateDoctorProfile(String doctorId, com.medibridge.core.dto.DoctorUpdateDTO updatedDoctor) {
        Doctor existing = getDoctorById(doctorId);
        
        if (updatedDoctor.getFullName() != null) existing.setFullName(updatedDoctor.getFullName());
        if (updatedDoctor.getPhone() != null) existing.setPhone(updatedDoctor.getPhone());
        if (updatedDoctor.getSpecialization() != null) existing.setSpecialization(updatedDoctor.getSpecialization());
        if (updatedDoctor.getExperienceYears() != null) existing.setExperienceYears(updatedDoctor.getExperienceYears());
        if (updatedDoctor.getConsultationFee() != null) existing.setConsultationFee(updatedDoctor.getConsultationFee());
        if (updatedDoctor.getConsultationDurationMin() != null) existing.setConsultationDurationMin(updatedDoctor.getConsultationDurationMin());
        if (updatedDoctor.getBio() != null) existing.setBio(updatedDoctor.getBio());
        
        return doctorRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AvailabilityDTO> getDoctorAvailability(String doctorId) {
        List<DoctorWeeklyAvailability> availabilities = availabilityRepository.findByDoctor_DoctorId(doctorId);
        
        // If not initialized, return default structure or empty
        return availabilities.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<AvailabilityDTO> updateDoctorAvailability(String doctorId, List<AvailabilityDTO> dtos) {
        Doctor doctor = getDoctorById(doctorId);
        List<DoctorWeeklyAvailability> existing = availabilityRepository.findByDoctor_DoctorId(doctorId);
        
        List<DoctorWeeklyAvailability> updatedList = new ArrayList<>();

        for (AvailabilityDTO dto : dtos) {
            // Find existing config for that day, or create new
            DoctorWeeklyAvailability dayConfig = existing.stream()
                    .filter(a -> a.getDayOfWeek() == dto.getDayOfWeek())
                    .findFirst()
                    .orElse(DoctorWeeklyAvailability.builder()
                            .doctor(doctor)
                            .dayOfWeek(dto.getDayOfWeek())
                            .build());

            dayConfig.setIsAvailable(dto.getIsAvailable());
            dayConfig.setMorningAvailable(dto.getMorningAvailable());
            dayConfig.setAfternoonAvailable(dto.getAfternoonAvailable());
            
            updatedList.add(availabilityRepository.save(dayConfig));
        }

        return updatedList.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    private AvailabilityDTO mapToDTO(DoctorWeeklyAvailability entity) {
        return AvailabilityDTO.builder()
                .availabilityId(entity.getAvailabilityId())
                .dayOfWeek(entity.getDayOfWeek())
                .isAvailable(entity.getIsAvailable())
                .morningAvailable(entity.getMorningAvailable())
                .afternoonAvailable(entity.getAfternoonAvailable())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getDoctorSlots(String doctorId, String dateString) {
        java.time.LocalDate date = java.time.LocalDate.parse(dateString);
        String dayName = date.getDayOfWeek().getDisplayName(java.time.format.TextStyle.FULL, java.util.Locale.ENGLISH);
        DoctorWeeklyAvailability.DayOfWeek dayOfWeek = DoctorWeeklyAvailability.DayOfWeek.valueOf(dayName);

        List<DoctorWeeklyAvailability> availabilities = availabilityRepository.findByDoctor_DoctorId(doctorId);
        DoctorWeeklyAvailability dayAvailability = availabilities.stream()
                .filter(a -> a.getDayOfWeek() == dayOfWeek)
                .findFirst()
                .orElse(null);

        if (dayAvailability == null || !dayAvailability.getIsAvailable()) {
            return new ArrayList<>();
        }

        List<String> possibleSlots = new ArrayList<>();
        if (dayAvailability.getMorningAvailable()) {
            possibleSlots.add("09:00 AM");
            possibleSlots.add("10:00 AM");
            possibleSlots.add("11:30 AM");
        }
        if (dayAvailability.getAfternoonAvailable()) {
            possibleSlots.add("02:00 PM");
            possibleSlots.add("03:30 PM");
            possibleSlots.add("05:00 PM");
        }

        java.time.LocalDateTime startOfDay = date.atStartOfDay();
        java.time.LocalDateTime endOfDay = date.atTime(23, 59, 59);
        List<com.medibridge.core.model.Appointment> appointments = appointmentRepository.findByDoctor_DoctorIdAndAppointmentDateBetween(doctorId, startOfDay, endOfDay);

        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("hh:mm a");
        for (com.medibridge.core.model.Appointment appt : appointments) {
            if (appt.getStatus() != com.medibridge.core.model.Appointment.Status.Cancelled && 
                appt.getStatus() != com.medibridge.core.model.Appointment.Status.Auto_Expired) {
                String bookedTime = appt.getAppointmentDate().format(formatter);
                possibleSlots.remove(bookedTime);
            }
        }

        if (date.equals(java.time.LocalDate.now())) {
            java.time.LocalTime nowTime = java.time.LocalTime.now();
            possibleSlots.removeIf(slotStr -> {
                java.time.LocalTime slotTime = java.time.LocalTime.parse(slotStr, formatter);
                return slotTime.isBefore(nowTime);
            });
        }

        return possibleSlots;
    }
}
