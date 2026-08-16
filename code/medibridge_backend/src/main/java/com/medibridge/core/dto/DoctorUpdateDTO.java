package com.medibridge.core.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorUpdateDTO {
    private String fullName;
    private String phone;
    private String specialization;
    private Integer experienceYears;
    private BigDecimal consultationFee;
    private Integer consultationDurationMin;
    private String bio;
}
