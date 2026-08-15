package com.medibridge.core.service;

import com.medibridge.core.model.Patient;

import java.util.List;

public interface PatientService {
    
    Patient getPatientById(Integer patientId);
    
    Patient updatePatientProfile(Integer patientId, com.medibridge.core.dto.PatientUpdateRequestDTO updatedPatient);
    
    List<Patient> getAllActivePatients();
}
