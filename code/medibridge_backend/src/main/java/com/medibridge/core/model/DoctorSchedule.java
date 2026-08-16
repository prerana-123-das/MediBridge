package com.medibridge.core.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * JPA Entity representing an individual bookable time slot for a doctor.
 */
@Entity
@Table(name = "doctor_schedule", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"doctor_id", "available_date", "start_time"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_id")
    private Integer scheduleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "available_date", nullable = false)
    private LocalDate availableDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "is_booked")
    @Builder.Default
    private Boolean isBooked = false;
}
