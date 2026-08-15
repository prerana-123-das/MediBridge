package com.medibridge.core.controller;

import com.medibridge.core.service.PdfExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;

@RestController
@RequestMapping("/api/v1/export")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ExportController {

    private final PdfExportService pdfExportService;

    @GetMapping(value = "/prescription/{id}", produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    public ResponseEntity<InputStreamResource> exportPrescriptionPdf(@PathVariable Integer id) {
        
        ByteArrayInputStream bis = pdfExportService.generatePrescriptionPdf(id);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=prescription_" + id + ".pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }

    @GetMapping(value = "/history/{patientId}", produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<InputStreamResource> exportPatientHistoryPdf(@PathVariable Integer patientId) {
        
        ByteArrayInputStream bis = pdfExportService.generatePatientHistoryPdf(patientId);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=history_patient_" + patientId + ".pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }
}
