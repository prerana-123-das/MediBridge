package com.medibridge.core.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RescheduleRequestDTO {
    
    @NotBlank(message = "New date is required")
    private String newDate;
    
    @NotBlank(message = "New time is required")
    private String newTime;
    
    private String reason;
}
