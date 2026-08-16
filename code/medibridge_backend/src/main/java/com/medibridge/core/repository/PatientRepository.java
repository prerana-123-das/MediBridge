package com.medibridge.core.repository;

import com.medibridge.core.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Integer> {
    java.util.Optional<Patient> findByEmail(String email);
    long countByStatus(Patient.Status status);
}

