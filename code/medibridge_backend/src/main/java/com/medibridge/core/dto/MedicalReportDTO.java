package com.medibridge.core.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@Builder
public class MedicalReportDTO {
    
    private Integer reportId;

    @NotBlank(message = "Report name is required")
    private String reportName;

    @NotBlank(message = "Report type is required")
    private String reportType;

    @NotBlank(message = "Report data URL is required")
    private String reportDataUrl;

    private String fileSize;
    
    private LocalDateTime uploadDate;
}
