package com.medibridge.core.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DoctorRegistrationRequest {

    @NotBlank(message = "Full name is required")
    @com.fasterxml.jackson.annotation.JsonAlias("fullName")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Specialization is required")
    private String specialization;

    @NotBlank(message = "License number is required")
    @com.fasterxml.jackson.annotation.JsonAlias("licenseNumber")
    private String licenseNumber;

    @NotNull(message = "Experience years is required")
    @com.fasterxml.jackson.annotation.JsonAlias("experienceYears")
    private Integer experienceYears;

    @NotNull(message = "Consultation fee is required")
    @com.fasterxml.jackson.annotation.JsonAlias("consultationFee")
    private BigDecimal consultationFee;

    private String bio;
}
