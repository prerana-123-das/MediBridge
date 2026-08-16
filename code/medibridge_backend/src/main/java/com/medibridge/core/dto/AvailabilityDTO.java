package com.medibridge.core.dto;

import com.medibridge.core.model.DoctorWeeklyAvailability;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AvailabilityDTO {
    private Integer availabilityId;
    private DoctorWeeklyAvailability.DayOfWeek dayOfWeek;
    private Boolean isAvailable;
    private Boolean morningAvailable;
    private Boolean afternoonAvailable;
}
