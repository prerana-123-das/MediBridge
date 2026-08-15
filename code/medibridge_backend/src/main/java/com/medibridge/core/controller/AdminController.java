package com.medibridge.core.controller;

import com.medibridge.core.dto.ApiResponse;
import com.medibridge.core.dto.DashboardStatsDTO;
import com.medibridge.core.model.AdminSystemSettings;
import com.medibridge.core.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getDashboardStats() {
        DashboardStatsDTO stats = adminService.getDashboardStats();
        
        // Ensure we send back an object that wraps the stats (and potentially recent activity)
        java.util.Map<String, Object> responseData = new java.util.HashMap<>();
        responseData.put("stats", stats);
        responseData.put("activity", new java.util.ArrayList<>()); // Stub for activity list
        
        return ResponseEntity.ok(new ApiResponse("Dashboard stats retrieved successfully", true, responseData));
    }

    @GetMapping("/settings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getSystemSettings() {
        AdminSystemSettings settings = adminService.getSystemSettings();
        return ResponseEntity.ok(new ApiResponse("System settings retrieved successfully", true, settings));
    }

    @PutMapping("/settings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> updateSystemSettings(@RequestBody AdminSystemSettings settings) {
        AdminSystemSettings updated = adminService.updateSystemSettings(settings);
        return ResponseEntity.ok(new ApiResponse("System settings updated successfully", true, updated));
    }

    @GetMapping("/patients")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getPatients() {
        return ResponseEntity.ok(new ApiResponse("Patients retrieved", true, adminService.getPatients()));
    }

    @GetMapping("/doctors")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getDoctors() {
        return ResponseEntity.ok(new ApiResponse("Doctors retrieved", true, adminService.getDoctors()));
    }

    @GetMapping("/appointments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getAppointments() {
        return ResponseEntity.ok(new ApiResponse("Appointments retrieved", true, adminService.getAppointments()));
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getAnalytics() {
        return ResponseEntity.ok(new ApiResponse("Analytics retrieved", true, adminService.getAnalytics()));
    }

    @PutMapping("/patients/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> updatePatientStatus(@PathVariable Integer id, @RequestBody java.util.Map<String, String> body) {
        String status = body.get("status");
        com.medibridge.core.model.Patient updated = adminService.updatePatientStatus(id, status);
        return ResponseEntity.ok(new ApiResponse("Patient status updated", true, updated));
    }

    @PutMapping("/doctors/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> updateDoctorStatus(@PathVariable String id, @RequestBody java.util.Map<String, String> body) {
        String status = body.get("status");
        com.medibridge.core.model.Doctor updated = adminService.updateDoctorStatus(id, status);
        return ResponseEntity.ok(new ApiResponse("Doctor status updated", true, updated));
    }

    @DeleteMapping("/appointments/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deleteAppointment(@PathVariable Integer id) {
        adminService.deleteAppointment(id);
        return ResponseEntity.ok(new ApiResponse("Appointment deleted successfully", true, null));
    }
}
