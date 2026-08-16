package com.medibridge.core.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Builder;

import java.time.LocalDate;

@Data
@Builder
public class PrescriptionDTO {

    private Integer prescriptionId;
    
    @NotNull(message = "Appointment ID is required")
    private Integer appointmentId;

    @NotBlank(message = "Diagnosis is required")
    private String diagnosis;

    private String notes;

    @NotBlank(message = "Prescription text is required")
    private String diagnosisText; // This holds the multi-line medication text

    private LocalDate dateIssued;
}
