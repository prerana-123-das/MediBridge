package com.medibridge.core.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * JPA Entity representing the recurring weekly availability pattern for a doctor.
 * Used by the frontend ManageSchedule toggles.
 */
@Entity
@Table(name = "doctor_weekly_availability", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"doctor_id", "day_of_week"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorWeeklyAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "availability_id")
    private Integer availabilityId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false)
    private DayOfWeek dayOfWeek;

    @Column(name = "is_available")
    @Builder.Default
    private Boolean isAvailable = false;

    @Column(name = "morning_available")
    @Builder.Default
    private Boolean morningAvailable = false;

    @Column(name = "afternoon_available")
    @Builder.Default
    private Boolean afternoonAvailable = false;

    public enum DayOfWeek {
        Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
    }
}
