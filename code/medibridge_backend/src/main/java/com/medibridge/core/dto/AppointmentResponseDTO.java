package com.medibridge.core.dto;

import com.medibridge.core.model.Appointment.Status;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AppointmentResponseDTO {
    private Integer appointmentId;
    private String doctorName;
    private String doctorSpecialization;
    private Integer patientId;
    private String patientName;
    private Integer patientAge;
    private String patientBloodGroup;
    private String patientGender;
    private LocalDateTime appointmentDate;
    private String type;
    private Status status;
    private String reason;
    private String description;
    private Boolean isRescheduled;
    private java.util.List<String> attachedFiles;
    private java.util.List<String> prescriptions;
    private Boolean isRated;
    private String meetLink;
}
