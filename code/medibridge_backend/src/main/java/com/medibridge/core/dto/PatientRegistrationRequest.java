package com.medibridge.core.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PatientRegistrationRequest {

    @NotBlank(message = "Full name is required")
    @com.fasterxml.jackson.annotation.JsonAlias("fullName")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "Password is required")
    // Note: You can add @Pattern for strict password policies here
    private String password;

    private String address;

    @com.fasterxml.jackson.annotation.JsonAlias("dateOfBirth")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Gender is required")
    @Pattern(regexp = "^(Male|Female|Other)$", message = "Gender must be Male, Female, or Other")
    private String gender;

    @NotBlank(message = "Blood group is required")
    @com.fasterxml.jackson.annotation.JsonAlias("bloodGroup")
    private String bloodGroup;
}
