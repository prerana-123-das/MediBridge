package com.medibridge.core.service.impl;

import com.medibridge.core.dto.DashboardStatsDTO;
import com.medibridge.core.dto.AppointmentResponseDTO;
import com.medibridge.core.model.AdminSystemSettings;
import com.medibridge.core.model.Doctor;
import com.medibridge.core.model.Patient;
import com.medibridge.core.repository.AdminSystemSettingsRepository;
import com.medibridge.core.repository.AppointmentRepository;
import com.medibridge.core.repository.DoctorRepository;
import com.medibridge.core.repository.PatientRepository;
import com.medibridge.core.repository.PaymentTransactionRepository;
import com.medibridge.core.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final PaymentTransactionRepository paymentRepository;
    private final AdminSystemSettingsRepository settingsRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats() {
        long totalPatients = patientRepository.countByStatus(Patient.Status.active);
        long activeDoctors = doctorRepository.countByStatus(Doctor.Status.active);
        long totalAppointments = appointmentRepository.count();
        
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1).minusNanos(1);
        
        long appointmentsToday = appointmentRepository.countByAppointmentDateBetween(startOfDay, endOfDay);
        long completedToday = appointmentRepository.countByAppointmentDateBetweenAndStatus(startOfDay, endOfDay, com.medibridge.core.model.Appointment.Status.Completed);
        
        BigDecimal consultations = paymentRepository.sumConsultationRevenue();
        BigDecimal followUps = paymentRepository.sumFollowUpRevenue();
        if (consultations == null) consultations = BigDecimal.ZERO;
        if (followUps == null) followUps = BigDecimal.ZERO;
        BigDecimal estimatedRevenue = consultations.add(followUps);

        return DashboardStatsDTO.builder()
                .totalPatients(totalPatients)
                .activeDoctors(activeDoctors)
                .totalAppointments(totalAppointments)
                .appointmentsToday(appointmentsToday)
                .completedToday(completedToday)
                .estimatedRevenue(estimatedRevenue)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminSystemSettings getSystemSettings() {
        return settingsRepository.findAll().stream().findFirst()
                .orElse(new AdminSystemSettings()); // Return default if none exists
    }

    @Override
    @Transactional
    public AdminSystemSettings updateSystemSettings(AdminSystemSettings updatedSettings) {
        AdminSystemSettings existing = getSystemSettings();
        
        existing.setPlatformName(updatedSettings.getPlatformName());
        existing.setSupportEmail(updatedSettings.getSupportEmail());
        existing.setMaxAppointmentsPerDay(updatedSettings.getMaxAppointmentsPerDay());
        existing.setSessionTimeout(updatedSettings.getSessionTimeout());
        
        return settingsRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<java.util.Map<String, Object>> getPatients() {
        return patientRepository.findAll().stream().map(patient -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("patientId", patient.getPatientId());
            map.put("fullName", patient.getFullName());
            map.put("phone", patient.getPhone());
            map.put("email", patient.getEmail());
            map.put("address", patient.getAddress());
            map.put("dateOfBirth", patient.getDateOfBirth());
            map.put("gender", patient.getGender());
            map.put("bloodGroup", patient.getBloodGroup());
            map.put("status", patient.getStatus());
            map.put("createdAt", patient.getCreatedAt());
            map.put("appointments", appointmentRepository.countByPatient_PatientId(patient.getPatientId()));
            return map;
        }).collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<java.util.Map<String, Object>> getDoctors() {
        return doctorRepository.findAll().stream().map(doctor -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("doctorId", doctor.getDoctorId());
            map.put("fullName", doctor.getFullName());
            map.put("email", doctor.getEmail());
            map.put("phone", doctor.getPhone());
            map.put("specialization", doctor.getSpecialization());
            map.put("licenseNumber", doctor.getLicenseNumber());
            map.put("experienceYears", doctor.getExperienceYears());
            map.put("consultationFee", doctor.getConsultationFee());
            map.put("consultationDurationMin", doctor.getConsultationDurationMin());
            map.put("bio", doctor.getBio());
            map.put("rating", doctor.getRating());
            map.put("ratingCount", doctor.getRatingCount());
            map.put("available", doctor.getAvailable());
            map.put("status", doctor.getStatus());
            map.put("createdAt", doctor.getCreatedAt());
            map.put("patients", appointmentRepository.countDistinctPatientsByDoctorId(doctor.getDoctorId()));
            return map;
        }).collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<AppointmentResponseDTO> getAppointments() {
        return appointmentRepository.findAll().stream().map(this::mapToDTO).collect(java.util.stream.Collectors.toList());
    }

    private AppointmentResponseDTO mapToDTO(com.medibridge.core.model.Appointment appointment) {
        return AppointmentResponseDTO.builder()
                .appointmentId(appointment.getAppointmentId())
                .doctorName(appointment.getDoctor().getFullName())
                .doctorSpecialization(appointment.getDoctor().getSpecialization())
                .patientName(appointment.getPatient().getFullName())
                .appointmentDate(appointment.getAppointmentDate())
                .type(appointment.getAppointmentType())
                .status(appointment.getStatus())
                .reason(appointment.getReason())
                .description(appointment.getDescription())
                .isRescheduled(appointment.getIsRescheduled())
                .attachedFiles(appointment.getAttachedFiles() != null ? new java.util.ArrayList<>(appointment.getAttachedFiles()) : new java.util.ArrayList<>())
                .prescriptions(appointment.getPrescriptions() != null ? new java.util.ArrayList<>(appointment.getPrescriptions()) : new java.util.ArrayList<>())
                .isRated(appointment.getIsRated())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.Map<String, Object> getAnalytics() {
        java.util.Map<String, Object> map = new java.util.HashMap<>();
        
        java.util.Map<String, Object> monthly = new java.util.HashMap<>();
        monthly.put("newPatients", patientRepository.count());
        monthly.put("newDoctors", doctorRepository.count());
        monthly.put("totalAppointments", appointmentRepository.count());
        monthly.put("completionRate", "92%");
        
        java.math.BigDecimal consultations = paymentRepository.sumConsultationRevenue();
        java.math.BigDecimal followUps = paymentRepository.sumFollowUpRevenue();
        java.math.BigDecimal total = consultations.add(followUps);
        
        java.util.Map<String, Object> revenue = new java.util.HashMap<>();
        revenue.put("consultations", consultations);
        revenue.put("followUps", followUps);
        revenue.put("total", total);
        
        map.put("monthly", monthly);
        map.put("revenue", revenue);
        
        return map;
    }

    @Override
    @Transactional
    public Patient updatePatientStatus(Integer patientId, String status) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + patientId));
        patient.setStatus(Patient.Status.valueOf(status.toLowerCase()));
        return patientRepository.save(patient);
    }

    @Override
    @Transactional
    public Doctor updateDoctorStatus(String doctorId, String status) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + doctorId));
        doctor.setStatus(Doctor.Status.valueOf(status.toLowerCase()));
        return doctorRepository.save(doctor);
    }

    @Override
    @Transactional
    public void deleteAppointment(Integer appointmentId) {
        if (!appointmentRepository.existsById(appointmentId)) {
            throw new RuntimeException("Appointment not found with id: " + appointmentId);
        }
        appointmentRepository.deleteById(appointmentId);
    }
}
