package com.medibridge.core.service;

import com.medibridge.core.dto.RatingDTO;

import java.util.List;

public interface RatingService {

    RatingDTO submitRating(Integer patientId, RatingDTO ratingDTO);
    
    List<RatingDTO> getDoctorRatings(String doctorId);
}
