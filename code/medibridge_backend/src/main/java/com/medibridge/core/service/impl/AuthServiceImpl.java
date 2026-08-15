package com.medibridge.core.service.impl;

import com.medibridge.core.dto.DoctorRegistrationRequest;
import com.medibridge.core.dto.PatientRegistrationRequest;
import com.medibridge.core.model.Doctor;
import com.medibridge.core.model.Patient;
import com.medibridge.core.repository.DoctorRepository;
import com.medibridge.core.repository.PatientRepository;
import com.medibridge.core.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void registerPatient(PatientRegistrationRequest request) {
        // Check if email already exists
        if (patientRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email is already registered.");
        }

        Patient patient = Patient.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .address(request.getAddress())
                .dateOfBirth(request.getDateOfBirth())
                .gender(Patient.Gender.valueOf(request.getGender()))
                .bloodGroup(request.getBloodGroup())
                .build();

        patientRepository.save(patient);
    }

    @Override
    @Transactional
    public void registerDoctor(DoctorRegistrationRequest request) {
        // Check if email already exists
        if (doctorRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email is already registered.");
        }

        Doctor doctor = Doctor.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .specialization(request.getSpecialization())
                .licenseNumber(request.getLicenseNumber())
                .experienceYears(request.getExperienceYears())
                .consultationFee(request.getConsultationFee())
                .bio(request.getBio())
                .build();

        doctorRepository.save(doctor);
    }

    @Override
    @Transactional
    public void resetPassword(String email, String newPassword) {
        String encodedPassword = passwordEncoder.encode(newPassword);
        
        var patientOpt = patientRepository.findByEmail(email);
        if (patientOpt.isPresent()) {
            Patient patient = patientOpt.get();
            patient.setPasswordHash(encodedPassword);
            patientRepository.save(patient);
            return;
        }
        
        var doctorOpt = doctorRepository.findByEmail(email);
        if (doctorOpt.isPresent()) {
            Doctor doctor = doctorOpt.get();
            doctor.setPasswordHash(encodedPassword);
            doctorRepository.save(doctor);
            return;
        }
        
        throw new IllegalArgumentException("User with email " + email + " not found.");
    }

    @Override
    @Transactional
    public void changePassword(String email, String currentPassword, String newPassword) {
        var patientOpt = patientRepository.findByEmail(email);
        if (patientOpt.isPresent()) {
            Patient patient = patientOpt.get();
            if (!passwordEncoder.matches(currentPassword, patient.getPasswordHash())) {
                throw new IllegalArgumentException("Incorrect current password.");
            }
            patient.setPasswordHash(passwordEncoder.encode(newPassword));
            patientRepository.save(patient);
            return;
        }

        var doctorOpt = doctorRepository.findByEmail(email);
        if (doctorOpt.isPresent()) {
            Doctor doctor = doctorOpt.get();
            if (!passwordEncoder.matches(currentPassword, doctor.getPasswordHash())) {
                throw new IllegalArgumentException("Incorrect current password.");
            }
            doctor.setPasswordHash(passwordEncoder.encode(newPassword));
            doctorRepository.save(doctor);
            return;
        }

        throw new IllegalArgumentException("User with email " + email + " not found.");
    }
}
