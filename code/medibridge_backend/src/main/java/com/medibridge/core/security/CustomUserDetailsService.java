package com.medibridge.core.security;

import com.medibridge.core.model.Admin;
import com.medibridge.core.model.Doctor;
import com.medibridge.core.model.Patient;
import com.medibridge.core.repository.AdminRepository;
import com.medibridge.core.repository.DoctorRepository;
import com.medibridge.core.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Custom service to load users from the database for authentication.
 * It checks Patient, Doctor, and Admin tables.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AdminRepository adminRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        
        // 1. Check if user is a Patient (login via email)
        Optional<Patient> patientOpt = patientRepository.findByEmail(identifier); // Requires adding findByEmail to repo
        if (patientOpt.isPresent()) {
            return CustomUserDetails.buildPatient(patientOpt.get());
        }

        // 2. Check if user is a Doctor (login via email)
        Optional<Doctor> doctorOpt = doctorRepository.findByEmail(identifier); // Requires adding findByEmail to repo
        if (doctorOpt.isPresent()) {
            return CustomUserDetails.buildDoctor(doctorOpt.get());
        }

        // 3. Check if user is an Admin (login via username or email)
        Optional<Admin> adminOpt = adminRepository.findByUsername(identifier);
        if (!adminOpt.isPresent()) {
            adminOpt = adminRepository.findByEmail(identifier);
        }
        if (adminOpt.isPresent()) {
            return CustomUserDetails.buildAdmin(adminOpt.get());
        }

        throw new UsernameNotFoundException("User not found with identifier: " + identifier);
    }
}
