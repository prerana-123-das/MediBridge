package com.medibridge.core.repository;

import com.medibridge.core.model.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Integer> {
    java.util.List<Rating> findByDoctor_DoctorId(String doctorId);
}

