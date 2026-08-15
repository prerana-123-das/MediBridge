package com.medibridge.core.service;

import com.medibridge.core.dto.DashboardStatsDTO;
import com.medibridge.core.dto.AppointmentResponseDTO;
import com.medibridge.core.model.AdminSystemSettings;

public interface AdminService {

    DashboardStatsDTO getDashboardStats();
    
    AdminSystemSettings getSystemSettings();
    
    AdminSystemSettings updateSystemSettings(AdminSystemSettings settings);
    
    java.util.List<java.util.Map<String, Object>> getPatients();
    
    java.util.List<java.util.Map<String, Object>> getDoctors();
    
    java.util.List<AppointmentResponseDTO> getAppointments();
    
    java.util.Map<String, Object> getAnalytics();
    
    com.medibridge.core.model.Patient updatePatientStatus(Integer patientId, String status);
    
    com.medibridge.core.model.Doctor updateDoctorStatus(String doctorId, String status);
    
    void deleteAppointment(Integer appointmentId);
}
