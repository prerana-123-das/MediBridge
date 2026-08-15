package com.medibridge.core.controller;

import com.medibridge.core.dto.ApiResponse;
import com.medibridge.core.model.Patient;
import com.medibridge.core.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PatientController {

    private final PatientService patientService;

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse> getPatientProfile(@PathVariable Integer id) {
        Patient patient = patientService.getPatientById(id);
        // Note: In production, map Patient to PatientDTO to hide passwordHash
        return ResponseEntity.ok(new ApiResponse("Patient profile retrieved successfully", true, patient));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse> updatePatientProfile(@PathVariable Integer id, @jakarta.validation.Valid @RequestBody com.medibridge.core.dto.PatientUpdateRequestDTO patientDetails) {
        Patient updated = patientService.updatePatientProfile(id, patientDetails);
        return ResponseEntity.ok(new ApiResponse("Profile updated successfully", true, updated));
    }
}
