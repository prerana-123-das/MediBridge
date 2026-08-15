package com.medibridge.core.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class DashboardStatsDTO {
    private long totalPatients;
    private long activeDoctors;
    private long appointmentsToday;
    private long completedToday;
    private long totalAppointments;
    private BigDecimal estimatedRevenue;
}
