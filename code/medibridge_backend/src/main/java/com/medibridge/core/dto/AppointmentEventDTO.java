package com.medibridge.core.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentEventDTO {
    private Integer appointmentId;
    private String patientName;
    private String doctorName;
    private String status;
    private String timestamp;
}
