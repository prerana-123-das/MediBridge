package com.medibridge.core.controller;

import com.medibridge.core.dto.ApiResponse;
import com.medibridge.core.dto.AvailabilityDTO;
import com.medibridge.core.model.Doctor;
import com.medibridge.core.repository.DoctorRepository;
import com.medibridge.core.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/doctors")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DoctorController {

    private final DoctorService doctorService;
    private final DoctorRepository doctorRepository;

    @GetMapping
    public ResponseEntity<ApiResponse> getAvailableDoctors() {
        List<Doctor> doctors = doctorService.getAvailableDoctors();
        // In prod, map to DoctorDTO to hide passwords
        return ResponseEntity.ok(new ApiResponse("Available doctors retrieved", true, doctors));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getDoctorProfile(@PathVariable String id) {
        Doctor doctor = doctorService.getDoctorById(id);
        return ResponseEntity.ok(new ApiResponse("Doctor retrieved", true, doctor));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse> updateMyProfile(@RequestBody com.medibridge.core.dto.DoctorUpdateDTO updatedDoctor, Authentication auth) {
        Doctor doctor = doctorRepository.findByEmail(auth.getName()).orElseThrow();
        Doctor saved = doctorService.updateDoctorProfile(doctor.getDoctorId(), updatedDoctor);
        return ResponseEntity.ok(new ApiResponse("Profile updated", true, saved));
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<ApiResponse> getAvailability(@PathVariable String id) {
        List<AvailabilityDTO> availability = doctorService.getDoctorAvailability(id);
        return ResponseEntity.ok(new ApiResponse("Availability retrieved", true, availability));
    }

    @PutMapping("/availability")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse> updateMyAvailability(@RequestBody List<AvailabilityDTO> availabilityList, Authentication auth) {
        Doctor doctor = doctorRepository.findByEmail(auth.getName()).orElseThrow();
        List<AvailabilityDTO> updated = doctorService.updateDoctorAvailability(doctor.getDoctorId(), availabilityList);
        return ResponseEntity.ok(new ApiResponse("Availability updated", true, updated));
    }

    @GetMapping("/specialties")
    public ResponseEntity<ApiResponse> getSpecialties() {
        List<Doctor> doctors = doctorRepository.findAll();
        java.util.Map<String, Long> specCounts = doctors.stream()
            .collect(java.util.stream.Collectors.groupingBy(
                d -> d.getSpecialization() != null ? d.getSpecialization() : "General",
                java.util.stream.Collectors.counting()
            ));
        
        List<java.util.Map<String, Object>> specialties = specCounts.entrySet().stream().map(entry -> {
            String spec = entry.getKey();
            Long count = entry.getValue();
            String icon = "🩺";
            String desc = "Specialized Medical Care";
            
            String s = spec.toLowerCase();
            if (s.contains("cardio")) { icon = "❤️"; desc = "Heart & Blood"; }
            else if (s.contains("derm")) { icon = "✨"; desc = "Skin Care"; }
            else if (s.contains("physician") || s.contains("general")) { icon = "👨‍⚕️"; desc = "Primary Care"; }
            else if (s.contains("ortho")) { icon = "🦴"; desc = "Bone & Joint"; }
            else if (s.contains("pedia")) { icon = "👶"; desc = "Child Care"; }
            else if (s.contains("neuro")) { icon = "🧠"; desc = "Brain & Nerves"; }

            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("name", spec);
            map.put("emoji", icon);
            map.put("description", desc);
            map.put("doctors", count);
            return map;
        }).collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(new ApiResponse("Specialties retrieved", true, specialties));
    }

    @GetMapping("/specializations")
    public ResponseEntity<ApiResponse> getSpecializations() {
        List<String> specs = doctorRepository.findAll().stream()
                .map(d -> d.getSpecialization() != null ? d.getSpecialization() : "General")
                .distinct()
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(new ApiResponse("Specializations retrieved", true, specs));
    }

    @GetMapping("/{id}/slots")
    public ResponseEntity<ApiResponse> getDoctorSlots(@PathVariable String id, @RequestParam(required = true) String date) {
        List<String> slots = doctorService.getDoctorSlots(id, date);
        return ResponseEntity.ok(new ApiResponse("Slots retrieved", true, slots));
    }
}
