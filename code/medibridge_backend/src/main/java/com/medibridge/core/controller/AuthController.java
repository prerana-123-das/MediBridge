package com.medibridge.core.controller;

import com.medibridge.core.dto.ApiResponse;
import com.medibridge.core.dto.AuthRequest;
import com.medibridge.core.dto.AuthResponse;
import com.medibridge.core.dto.*;
import com.medibridge.core.security.JwtUtil;
import com.medibridge.core.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Update this to match frontend URL in production
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final AuthService authService;
    private final com.medibridge.core.repository.PatientRepository patientRepository;
    private final com.medibridge.core.repository.DoctorRepository doctorRepository;
    private final com.medibridge.core.repository.AdminRepository adminRepository;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody AuthRequest request) {
        // Authenticate the user (checks DB via CustomUserDetailsService)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        
        // Generate JWT
        String token = jwtUtil.generateToken(userDetails);
        
        // Extract Role
        String authority = userDetails.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElse("ROLE_USER");

        AuthResponse.UserDetails userDetailsDTO = new AuthResponse.UserDetails();
        
        if ("ROLE_PATIENT".equals(authority)) {
            com.medibridge.core.model.Patient patient = patientRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            userDetailsDTO.setId(String.valueOf(patient.getPatientId()));
            userDetailsDTO.setName(patient.getFullName());
            userDetailsDTO.setEmail(patient.getEmail());
            userDetailsDTO.setRole("patient");
        } else if ("ROLE_DOCTOR".equals(authority)) {
            com.medibridge.core.model.Doctor doctor = doctorRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            userDetailsDTO.setId(doctor.getDoctorId());
            userDetailsDTO.setName(doctor.getFullName());
            userDetailsDTO.setEmail(doctor.getEmail());
            userDetailsDTO.setRole("doctor");
        } else if ("ROLE_ADMIN".equals(authority)) {
            com.medibridge.core.model.Admin admin = adminRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            userDetailsDTO.setId(String.valueOf(admin.getAdminId()));
            userDetailsDTO.setName(admin.getUsername());
            userDetailsDTO.setEmail(admin.getEmail());
            userDetailsDTO.setRole("admin");
        }

        AuthResponse authResponse = new AuthResponse(token, userDetailsDTO);
        
        return ResponseEntity.ok(new ApiResponse("Login successful", true, authResponse));
    }

    @PostMapping("/register/patient")
    public ResponseEntity<ApiResponse> registerPatient(@Valid @RequestBody PatientRegistrationRequest request) {
        try {
            authService.registerPatient(request);
            
            // Automatically log them in post-registration
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtUtil.generateToken(userDetails);
            com.medibridge.core.model.Patient patient = patientRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            
            AuthResponse.UserDetails userDetailsDTO = AuthResponse.UserDetails.builder()
                    .id(String.valueOf(patient.getPatientId()))
                    .name(patient.getFullName())
                    .email(patient.getEmail())
                    .role("patient")
                    .build();
            
            AuthResponse authResponse = new AuthResponse(token, userDetailsDTO);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse("Patient registered successfully", true, authResponse));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage(), false));
        }
    }

    @PostMapping("/register/doctor")
    public ResponseEntity<ApiResponse> registerDoctor(@Valid @RequestBody DoctorRegistrationRequest request) {
        try {
            authService.registerDoctor(request);
            
            // Automatically log them in post-registration
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtUtil.generateToken(userDetails);
            com.medibridge.core.model.Doctor doctor = doctorRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            
            AuthResponse.UserDetails userDetailsDTO = AuthResponse.UserDetails.builder()
                    .id(doctor.getDoctorId())
                    .name(doctor.getFullName())
                    .email(doctor.getEmail())
                    .role("doctor")
                    .build();
            
            AuthResponse authResponse = new AuthResponse(token, userDetailsDTO);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse("Doctor registered successfully", true, authResponse));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage(), false));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            authService.resetPassword(request.getEmail(), request.getNewPassword());
            return ResponseEntity.ok(new ApiResponse("Password reset successfully", true));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage(), false));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse> changePassword(@Valid @RequestBody ChangePasswordRequest request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse("Not authenticated", false));
        }
        
        try {
            String email = authentication.getName();
            authService.changePassword(email, request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok(new ApiResponse("Password changed successfully", true));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage(), false));
        }
    }
}
