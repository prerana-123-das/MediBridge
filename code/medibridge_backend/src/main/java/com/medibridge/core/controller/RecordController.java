package com.medibridge.core.controller;

import com.medibridge.core.dto.ApiResponse;
import com.medibridge.core.dto.MedicalReportDTO;
import com.medibridge.core.dto.PrescriptionDTO;
import com.medibridge.core.model.Doctor;
import com.medibridge.core.model.Patient;
import com.medibridge.core.repository.DoctorRepository;
import com.medibridge.core.repository.PatientRepository;
import com.medibridge.core.service.RecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/records")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RecordController {

    private final RecordService recordService;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    // --- PATIENT ENDPOINTS ---

    @PostMapping("/reports")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse> uploadReport(@Valid @RequestBody MedicalReportDTO request, Authentication auth) {
        Patient patient = patientRepository.findByEmail(auth.getName()).orElseThrow();
        MedicalReportDTO saved = recordService.uploadMedicalReport(patient.getPatientId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse("Report uploaded successfully", true, saved));
    }

    @GetMapping("/reports")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse> getMyReports(Authentication auth) {
        Patient patient = patientRepository.findByEmail(auth.getName()).orElseThrow();
        List<MedicalReportDTO> reports = recordService.getPatientReports(patient.getPatientId());
        return ResponseEntity.ok(new ApiResponse("Reports retrieved", true, reports));
    }

    @DeleteMapping("/reports/{id}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse> deleteReport(@PathVariable Integer id, Authentication auth) {
        Patient patient = patientRepository.findByEmail(auth.getName()).orElseThrow();
        recordService.deleteMedicalReport(id, patient.getPatientId());
        return ResponseEntity.ok(new ApiResponse("Report deleted successfully", true));
    }

    // --- DOCTOR ENDPOINTS ---

    @PostMapping("/consultations")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse> addConsultationRecord(@Valid @RequestBody PrescriptionDTO request, Authentication auth) {
        Doctor doctor = doctorRepository.findByEmail(auth.getName()).orElseThrow();
        
        try {
            PrescriptionDTO saved = recordService.addConsultationAndPrescription(doctor.getDoctorId(), request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse("Consultation & Prescription saved successfully", true, saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiResponse(e.getMessage(), false));
        }
    }
}
