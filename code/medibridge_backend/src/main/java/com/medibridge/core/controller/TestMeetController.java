package com.medibridge.core.controller;

import com.medibridge.core.model.Appointment;
import com.medibridge.core.repository.AppointmentRepository;
import com.medibridge.core.service.GoogleCalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/test")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TestMeetController {
    
    private final GoogleCalendarService googleCalendarService;
    private final AppointmentRepository appointmentRepository;

    @GetMapping("/meet")
    public String testMeet() {
        try {
            Appointment appt = appointmentRepository.findById(16).orElse(null);
            if (appt == null) return "Appointment 16 not found";
            
            String link = googleCalendarService.createMeetLink(appt);
            if (link != null) return "SUCCESS: " + link;
            
            return "FAILED. Check backend console/logs.";
        } catch (Exception e) {
            e.printStackTrace();
            return "ERROR: " + e.getMessage();
        }
    }
}
