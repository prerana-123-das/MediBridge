package com.medibridge.core.repository;

import com.medibridge.core.model.DoctorWeeklyAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorWeeklyAvailabilityRepository extends JpaRepository<DoctorWeeklyAvailability, Integer> {
    java.util.List<DoctorWeeklyAvailability> findByDoctor_DoctorId(String doctorId);
}

