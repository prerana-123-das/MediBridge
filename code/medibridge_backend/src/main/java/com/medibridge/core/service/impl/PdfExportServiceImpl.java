package com.medibridge.core.service.impl;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.medibridge.core.exception.ResourceNotFoundException;
import com.medibridge.core.model.Appointment;
import com.medibridge.core.model.Patient;
import com.medibridge.core.model.Prescription;
import com.medibridge.core.repository.AppointmentRepository;
import com.medibridge.core.repository.PatientRepository;
import com.medibridge.core.repository.PrescriptionRepository;
import com.medibridge.core.service.PdfExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PdfExportServiceImpl implements PdfExportService {

    private final PrescriptionRepository prescriptionRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;

    @Override
    public ByteArrayInputStream generatePrescriptionPdf(Integer prescriptionId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found"));

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 12);

            document.add(new Paragraph("MediBridge - Medical Prescription", titleFont));
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Doctor: " + prescription.getDoctor().getFullName(), headerFont));
            document.add(new Paragraph("Specialization: " + prescription.getDoctor().getSpecialization(), bodyFont));
            document.add(new Paragraph("Date: " + prescription.getDateIssued().toString(), bodyFont));
            document.add(new Paragraph(" "));
            
            document.add(new Paragraph("Patient: " + prescription.getPatient().getFullName(), headerFont));
            document.add(new Paragraph("Age: " + (java.time.LocalDate.now().getYear() - prescription.getPatient().getDateOfBirth().getYear()), bodyFont));
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Diagnosis:", headerFont));
            document.add(new Paragraph(prescription.getConsultation().getDiagnosis(), bodyFont));
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Prescription Details:", headerFont));
            document.add(new Paragraph(prescription.getDiagnosisText(), bodyFont));

            document.close();
        } catch (DocumentException ex) {
            throw new RuntimeException("Error generating PDF", ex);
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    @Override
    public ByteArrayInputStream generatePatientHistoryPdf(Integer patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        List<Appointment> appointments = appointmentRepository.findByPatient_PatientIdOrderByAppointmentDateDesc(patientId);

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 12);

            document.add(new Paragraph("MediBridge - Full Medical History", titleFont));
            document.add(new Paragraph("Patient: " + patient.getFullName(), headerFont));
            document.add(new Paragraph("Date Generated: " + java.time.LocalDate.now().toString(), bodyFont));
            document.add(new Paragraph(" "));

            for (Appointment appt : appointments) {
                document.add(new Paragraph("Appointment Date: " + appt.getAppointmentDate(), headerFont));
                document.add(new Paragraph("Doctor: " + appt.getDoctor().getFullName(), bodyFont));
                document.add(new Paragraph("Status: " + appt.getStatus().name(), bodyFont));
                document.add(new Paragraph("Reason: " + appt.getReason(), bodyFont));
                document.add(new Paragraph("--------------------------------------------------", bodyFont));
            }

            document.close();
        } catch (DocumentException ex) {
            throw new RuntimeException("Error generating PDF", ex);
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
}
