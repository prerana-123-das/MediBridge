package com.medibridge.core.controller;

import com.medibridge.core.dto.ApiResponse;
import com.medibridge.core.dto.RatingDTO;
import com.medibridge.core.model.Patient;
import com.medibridge.core.repository.PatientRepository;
import com.medibridge.core.service.RatingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ratings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RatingController {

    private final RatingService ratingService;
    private final PatientRepository patientRepository;

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse> submitRating(@Valid @RequestBody RatingDTO request, Authentication auth) {
        Patient patient = patientRepository.findByEmail(auth.getName()).orElseThrow();
        
        try {
            RatingDTO saved = ratingService.submitRating(patient.getPatientId(), request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse("Rating submitted successfully", true, saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse> getDoctorRatings(@PathVariable String doctorId) {
        List<RatingDTO> ratings = ratingService.getDoctorRatings(doctorId);
        return ResponseEntity.ok(new ApiResponse("Ratings retrieved", true, ratings));
    }
}
