package com.medibridge.core.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonAlias;

import java.time.LocalDate;

/**
 * DTO representing a request to update a Patient's profile.
 * Supports flexible JSON naming (both snake_case and camelCase).
 */
@Data
public class PatientUpdateRequestDTO {

    @NotBlank(message = "Full name is required")
    @JsonAlias("fullName")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @JsonAlias("dateOfBirth")
    private LocalDate dateOfBirth;

    private String address;

    @JsonAlias("bloodGroup")
    private String bloodGroup;
}
