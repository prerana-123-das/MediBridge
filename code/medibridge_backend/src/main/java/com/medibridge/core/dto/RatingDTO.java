package com.medibridge.core.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RatingDTO {
    
    private Integer ratingId;

    @NotNull(message = "Appointment ID is required")
    private Integer appointmentId;

    @NotNull(message = "Stars rating is required")
    @Min(1)
    @Max(5)
    private Byte stars;

    @NotNull(message = "Overall experience is required")
    private String overallExperience;

    private Byte punctualityRating;
    private Byte communicationRating;
    private Byte knowledgeRating;
    private Byte careRating;

    // A comma-separated string mapping to the SET column in the database
    private String whatStoodOut;

    private String reviewText;
    private Boolean recommend;
    private Boolean isAnonymous;
    
    private String patientName; // Included in response if not anonymous
}
