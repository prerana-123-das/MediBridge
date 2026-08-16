package com.medibridge.core.repository;

import com.medibridge.core.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, String> {
    java.util.Optional<Doctor> findByEmail(String email);
    long countByStatus(Doctor.Status status);
}

