package com.medibridge.core.service;

import com.medibridge.core.model.Doctor;

import java.util.List;

public interface DoctorService {

    Doctor getDoctorById(String doctorId);

    List<Doctor> getAvailableDoctors();
    
    Doctor updateDoctorProfile(String doctorId, com.medibridge.core.dto.DoctorUpdateDTO updatedDoctor);
    
    List<com.medibridge.core.dto.AvailabilityDTO> getDoctorAvailability(String doctorId);
    
    List<com.medibridge.core.dto.AvailabilityDTO> updateDoctorAvailability(String doctorId, List<com.medibridge.core.dto.AvailabilityDTO> availabilityList);

    List<String> getDoctorSlots(String doctorId, String dateString);
}
