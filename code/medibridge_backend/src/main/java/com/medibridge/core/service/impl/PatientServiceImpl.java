package com.medibridge.core.service.impl;

import com.medibridge.core.exception.ResourceNotFoundException;
import com.medibridge.core.model.Patient;
import com.medibridge.core.repository.PatientRepository;
import com.medibridge.core.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;

    @Override
    @Transactional(readOnly = true)
    public Patient getPatientById(Integer patientId) {
        return patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));
    }

    @Override
    @Transactional
    public Patient updatePatientProfile(Integer patientId, com.medibridge.core.dto.PatientUpdateRequestDTO dto) {
        Patient existing = getPatientById(patientId);
        
        // Update allowed fields with safety checks
        existing.setFullName(dto.getFullName());
        existing.setPhone(dto.getPhone());
        existing.setEmail(dto.getEmail());
        
        if (dto.getDateOfBirth() != null) {
            existing.setDateOfBirth(dto.getDateOfBirth());
        }
        if (dto.getAddress() != null) {
            existing.setAddress(dto.getAddress());
        }
        if (dto.getBloodGroup() != null && !dto.getBloodGroup().isBlank()) {
            existing.setBloodGroup(dto.getBloodGroup());
        }
        
        return patientRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Patient> getAllActivePatients() {
        // In a real scenario, you'd add a method findByStatus(Status.active) to the repository
        return patientRepository.findAll();
    }
}
