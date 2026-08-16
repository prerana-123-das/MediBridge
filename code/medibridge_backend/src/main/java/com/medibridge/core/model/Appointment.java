package com.medibridge.core.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * JPA Entity representing an Appointment booking.
 * Links a Patient and a Doctor.
 */
@Entity
@Table(name = "appointment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "appointment_id")
    private Integer appointmentId;

    // Many appointments belong to one patient
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    // Many appointments belong to one doctor
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id")
    private DoctorSchedule schedule;

    @CreationTimestamp
    @Column(name = "request_date", updatable = false)
    private LocalDateTime requestDate;

    @Column(name = "appointment_date", nullable = false)
    private LocalDateTime appointmentDate;

    @Column(name = "appointment_type", length = 30)
    @Builder.Default
    private String appointmentType = "Consultation";

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private Status status = Status.Pending;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_rescheduled")
    @Builder.Default
    private Boolean isRescheduled = false;

    @Column(name = "is_rated")
    @Builder.Default
    private Boolean isRated = false;

    @Column(name = "meet_link", length = 500)
    private String meetLink;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "appointment_files", joinColumns = @JoinColumn(name = "appointment_id"))
    @Column(name = "file_name")
    @Builder.Default
    private java.util.List<String> attachedFiles = new java.util.ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "appointment_prescriptions", joinColumns = @JoinColumn(name = "appointment_id"))
    @Column(name = "prescription")
    @Builder.Default
    private java.util.List<String> prescriptions = new java.util.ArrayList<>();

    // Enum matching frontend exactly
    public enum Status {
        Pending, Confirmed, Suggested, Cancelled, Completed, Auto_Expired
    }
}
