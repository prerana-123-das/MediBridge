package com.medibridge.core.service;

import com.medibridge.core.dto.DoctorRegistrationRequest;
import com.medibridge.core.dto.PatientRegistrationRequest;

public interface AuthService {
    
    void registerPatient(PatientRegistrationRequest request);
    void registerDoctor(DoctorRegistrationRequest request);
    
    void resetPassword(String email, String newPassword);
    void changePassword(String email, String currentPassword, String newPassword);
}
