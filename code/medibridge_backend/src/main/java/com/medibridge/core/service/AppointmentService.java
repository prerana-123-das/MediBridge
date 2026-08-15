package com.medibridge.core.service;

import com.medibridge.core.dto.AppointmentRequestDTO;
import com.medibridge.core.dto.AppointmentResponseDTO;
import com.medibridge.core.model.Appointment;

import java.util.List;

public interface AppointmentService {

    AppointmentResponseDTO bookAppointment(Integer patientId, AppointmentRequestDTO request);
    
    AppointmentResponseDTO updateAppointmentStatus(Integer appointmentId, Appointment.Status status, String doctorId);
    
    List<AppointmentResponseDTO> getPatientAppointments(Integer patientId);
    
    List<AppointmentResponseDTO> getDoctorAppointments(String doctorId);
    
    AppointmentResponseDTO cancelAppointment(Integer appointmentId, Integer patientId);
    
    AppointmentResponseDTO doctorRescheduleAppointment(Integer appointmentId, String doctorId, com.medibridge.core.dto.RescheduleRequestDTO request);
    
    AppointmentResponseDTO patientRespondToReschedule(Integer appointmentId, Integer patientId, boolean accepted);
    
    AppointmentResponseDTO patientRescheduleAppointment(Integer appointmentId, Integer patientId, com.medibridge.core.dto.RescheduleRequestDTO request);

    AppointmentResponseDTO updatePrescriptions(Integer appointmentId, String doctorId, java.util.List<String> prescriptions);

    AppointmentResponseDTO rateAppointment(Integer appointmentId, Integer patientId, com.medibridge.core.dto.RateRequestDTO request);
}
