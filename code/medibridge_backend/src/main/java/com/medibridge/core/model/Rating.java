package com.medibridge.core.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * JPA Entity representing a Patient's Rating and Review of a Doctor.
 */
@Entity
@Table(name = "rating")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rating_id")
    private Integer ratingId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", nullable = false, unique = true)
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "stars", nullable = false)
    private Byte stars; // TINYINT 1-5

    @Enumerated(EnumType.STRING)
    @Column(name = "overall_experience", nullable = false)
    private Experience overallExperience;

    // Sub-ratings
    @Column(name = "punctuality_rating")
    private Byte punctualityRating;

    @Column(name = "communication_rating")
    private Byte communicationRating;

    @Column(name = "knowledge_rating")
    private Byte knowledgeRating;

    @Column(name = "care_rating")
    private Byte careRating;

    // Mapping MySQL SET to a comma-separated String for simplicity, or we can use custom converters.
    // For now, storing the raw string.
    @Column(name = "what_stood_out", columnDefinition = "SET('Very helpful','Attentive listener','Clear explanation','On time','Professional','Friendly','Thorough checkup','Would recommend','Great experience')")
    private String whatStoodOut;

    @Column(name = "review_text", columnDefinition = "TEXT")
    private String reviewText;

    @Column(name = "recommend")
    private Boolean recommend;

    @Column(name = "is_anonymous")
    @Builder.Default
    private Boolean isAnonymous = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum Experience {
        Excellent, Good, Okay, Poor
    }
}
