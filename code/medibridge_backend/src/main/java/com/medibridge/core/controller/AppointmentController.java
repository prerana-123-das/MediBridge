package com.medibridge.core.controller;

import com.medibridge.core.dto.ApiResponse;
import com.medibridge.core.dto.AppointmentRequestDTO;
import com.medibridge.core.dto.AppointmentResponseDTO;
import com.medibridge.core.model.Appointment;
import com.medibridge.core.model.Patient;
import com.medibridge.core.model.Doctor;
import com.medibridge.core.repository.DoctorRepository;
import com.medibridge.core.repository.PatientRepository;
import com.medibridge.core.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse> bookAppointment(@Valid @RequestBody AppointmentRequestDTO request, Authentication authentication) {
        // Extract Patient ID from logged-in user email
        String email = authentication.getName();
        Patient patient = patientRepository.findByEmail(email).orElseThrow();
        
        AppointmentResponseDTO response = appointmentService.bookAppointment(patient.getPatientId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse("Appointment booked successfully (Pending)", true, response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse> updateStatus(@PathVariable Integer id, @RequestParam Appointment.Status status, Authentication authentication) {
        // Extract Doctor ID from logged-in user email
        String email = authentication.getName();
        Doctor doctor = doctorRepository.findByEmail(email).orElseThrow();
        
        try {
            AppointmentResponseDTO response = appointmentService.updateAppointmentStatus(id, status, doctor.getDoctorId());
            return ResponseEntity.ok(new ApiResponse("Status updated successfully", true, response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse(e.getMessage(), false));
        }
    }

    @PatchMapping("/{id}/respond")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse> respondToAppointment(@PathVariable Integer id, @RequestBody java.util.Map<String, String> body, Authentication authentication) {
        String email = authentication.getName();
        Doctor doctor = doctorRepository.findByEmail(email).orElseThrow();
        
        String action = body.get("action");
        Appointment.Status newStatus = "confirm".equalsIgnoreCase(action) ? Appointment.Status.Confirmed : Appointment.Status.Cancelled;
        
        try {
            AppointmentResponseDTO response = appointmentService.updateAppointmentStatus(id, newStatus, doctor.getDoctorId());
            return ResponseEntity.ok(new ApiResponse("Appointment responded successfully", true, response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiResponse(e.getMessage(), false));
        }
    }

    @PatchMapping("/{id}/prescription")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse> updatePrescription(@PathVariable Integer id, @RequestBody java.util.Map<String, java.util.List<String>> body, Authentication authentication) {
        String email = authentication.getName();
        Doctor doctor = doctorRepository.findByEmail(email).orElseThrow();
        
        java.util.List<String> prescriptions = body.get("prescriptions");
        try {
            AppointmentResponseDTO response = appointmentService.updatePrescriptions(id, doctor.getDoctorId(), prescriptions);
            return ResponseEntity.ok(new ApiResponse("Prescriptions updated successfully", true, response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiResponse(e.getMessage(), false));
        }
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse> cancelAppointment(@PathVariable Integer id, Authentication authentication) {
        String email = authentication.getName();
        Patient patient = patientRepository.findByEmail(email).orElseThrow();
        
        try {
            AppointmentResponseDTO response = appointmentService.cancelAppointment(id, patient.getPatientId());
            return ResponseEntity.ok(new ApiResponse("Appointment cancelled", true, response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiResponse(e.getMessage(), false));
        }
    }
    
    @PatchMapping("/{id}/reschedule")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse> doctorReschedule(@PathVariable Integer id, @Valid @RequestBody com.medibridge.core.dto.RescheduleRequestDTO request, Authentication authentication) {
        String email = authentication.getName();
        Doctor doctor = doctorRepository.findByEmail(email).orElseThrow();
        
        try {
            AppointmentResponseDTO response = appointmentService.doctorRescheduleAppointment(id, doctor.getDoctorId(), request);
            return ResponseEntity.ok(new ApiResponse("Reschedule suggested to patient", true, response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiResponse(e.getMessage(), false));
        }
    }

    @PatchMapping("/{id}/patient-reschedule")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse> patientReschedule(@PathVariable Integer id, @Valid @RequestBody com.medibridge.core.dto.RescheduleRequestDTO request, Authentication authentication) {
        String email = authentication.getName();
        Patient patient = patientRepository.findByEmail(email).orElseThrow();
        
        try {
            AppointmentResponseDTO response = appointmentService.patientRescheduleAppointment(id, patient.getPatientId(), request);
            return ResponseEntity.ok(new ApiResponse("Reschedule requested to doctor", true, response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiResponse(e.getMessage(), false));
        }
    }

    @PatchMapping("/{id}/patient-response")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse> patientResponse(@PathVariable Integer id, @RequestBody java.util.Map<String, String> body, Authentication authentication) {
        String email = authentication.getName();
        Patient patient = patientRepository.findByEmail(email).orElseThrow();
        
        String action = body.get("action");
        boolean accepted = "accept".equalsIgnoreCase(action);
        
        try {
            AppointmentResponseDTO response = appointmentService.patientRespondToReschedule(id, patient.getPatientId(), accepted);
            return ResponseEntity.ok(new ApiResponse("Patient response recorded", true, response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/patient")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse> getMyPatientAppointments(Authentication authentication) {
        String email = authentication.getName();
        Patient patient = patientRepository.findByEmail(email).orElseThrow();
        
        List<AppointmentResponseDTO> appointments = appointmentService.getPatientAppointments(patient.getPatientId());
        return ResponseEntity.ok(new ApiResponse("Appointments retrieved", true, appointments));
    }

    @GetMapping("/doctor/dashboard")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse> getMyDoctorAppointments(Authentication authentication) {
        String email = authentication.getName();
        Doctor doctor = doctorRepository.findByEmail(email).orElseThrow();
        
        List<AppointmentResponseDTO> appointments = appointmentService.getDoctorAppointments(doctor.getDoctorId());
        return ResponseEntity.ok(new ApiResponse("Appointments retrieved", true, appointments));
    }

    @PostMapping("/{id}/rate")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse> rateAppointment(@PathVariable Integer id, @Valid @RequestBody com.medibridge.core.dto.RateRequestDTO request, Authentication authentication) {
        String email = authentication.getName();
        Patient patient = patientRepository.findByEmail(email).orElseThrow();
        
        try {
            AppointmentResponseDTO response = appointmentService.rateAppointment(id, patient.getPatientId(), request);
            return ResponseEntity.ok(new ApiResponse("Rating submitted successfully", true, response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiResponse(e.getMessage(), false));
        }
    }
}
