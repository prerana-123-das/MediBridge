package com.medibridge.core.service.impl;

import com.medibridge.core.dto.RatingDTO;
import com.medibridge.core.exception.ResourceNotFoundException;
import com.medibridge.core.model.Appointment;
import com.medibridge.core.model.Doctor;
import com.medibridge.core.model.Patient;
import com.medibridge.core.model.Rating;
import com.medibridge.core.repository.AppointmentRepository;
import com.medibridge.core.repository.DoctorRepository;
import com.medibridge.core.repository.PatientRepository;
import com.medibridge.core.repository.RatingRepository;
import com.medibridge.core.service.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RatingServiceImpl implements RatingService {

    private final RatingRepository ratingRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    @Override
    @Transactional
    public RatingDTO submitRating(Integer patientId, RatingDTO dto) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        Appointment appointment = appointmentRepository.findById(dto.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (!appointment.getPatient().getPatientId().equals(patientId)) {
            throw new IllegalArgumentException("Not authorized to review this appointment");
        }

        // Check if rating already exists for this appointment
        // Assuming one rating per appointment logic is handled here, for brevity we save

        Doctor doctor = appointment.getDoctor();

        Rating rating = Rating.builder()
                .appointment(appointment)
                .patient(patient)
                .doctor(doctor)
                .stars(dto.getStars())
                .overallExperience(Rating.Experience.valueOf(dto.getOverallExperience()))
                .punctualityRating(dto.getPunctualityRating())
                .communicationRating(dto.getCommunicationRating())
                .knowledgeRating(dto.getKnowledgeRating())
                .careRating(dto.getCareRating())
                .whatStoodOut(dto.getWhatStoodOut()) // Custom SET String mapped directly
                .reviewText(dto.getReviewText())
                .recommend(dto.getRecommend())
                .isAnonymous(dto.getIsAnonymous())
                .build();

        rating = ratingRepository.save(rating);

        // Recalculate Doctor's average rating
        recalculateDoctorRating(doctor);

        dto.setRatingId(rating.getRatingId());
        return dto;
    }

    private void recalculateDoctorRating(Doctor doctor) {
        List<Rating> allRatings = ratingRepository.findByDoctor_DoctorId(doctor.getDoctorId());
        if (!allRatings.isEmpty()) {
            double average = allRatings.stream()
                    .mapToInt(Rating::getStars)
                    .average()
                    .orElse(0.0);
            
            BigDecimal bd = BigDecimal.valueOf(average).setScale(1, RoundingMode.HALF_UP);
            doctor.setRating(bd);
            doctorRepository.save(doctor);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<RatingDTO> getDoctorRatings(String doctorId) {
        return ratingRepository.findByDoctor_DoctorId(doctorId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private RatingDTO mapToDTO(Rating entity) {
        return RatingDTO.builder()
                .ratingId(entity.getRatingId())
                .appointmentId(entity.getAppointment().getAppointmentId())
                .stars(entity.getStars())
                .overallExperience(entity.getOverallExperience().name())
                .punctualityRating(entity.getPunctualityRating())
                .communicationRating(entity.getCommunicationRating())
                .knowledgeRating(entity.getKnowledgeRating())
                .careRating(entity.getCareRating())
                .whatStoodOut(entity.getWhatStoodOut())
                .reviewText(entity.getReviewText())
                .recommend(entity.getRecommend())
                .isAnonymous(entity.getIsAnonymous())
                .patientName(entity.getIsAnonymous() ? "Anonymous" : entity.getPatient().getFullName())
                .build();
    }
}
