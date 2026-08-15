package com.medibridge.core.service.impl;

import com.medibridge.core.dto.MedicalReportDTO;
import com.medibridge.core.dto.PrescriptionDTO;
import com.medibridge.core.exception.ResourceNotFoundException;
import com.medibridge.core.model.Appointment;
import com.medibridge.core.model.ConsultationRecord;
import com.medibridge.core.model.MedicalReport;
import com.medibridge.core.model.Patient;
import com.medibridge.core.model.Prescription;
import com.medibridge.core.repository.AppointmentRepository;
import com.medibridge.core.repository.ConsultationRecordRepository;
import com.medibridge.core.repository.MedicalReportRepository;
import com.medibridge.core.repository.PatientRepository;
import com.medibridge.core.repository.PrescriptionRepository;
import com.medibridge.core.service.RecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecordServiceImpl implements RecordService {

    private final MedicalReportRepository medicalReportRepository;
    private final ConsultationRecordRepository consultationRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;

    @Override
    @Transactional
    public MedicalReportDTO uploadMedicalReport(Integer patientId, MedicalReportDTO dto) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        MedicalReport report = MedicalReport.builder()
                .patient(patient)
                .reportName(dto.getReportName())
                .reportType(dto.getReportType())
                .reportDataUrl(dto.getReportDataUrl())
                .fileSize(dto.getFileSize())
                .build();

        MedicalReport saved = medicalReportRepository.save(report);
        dto.setReportId(saved.getReportId());
        dto.setUploadDate(saved.getUploadDate());
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicalReportDTO> getPatientReports(Integer patientId) {
        return medicalReportRepository.findByPatient_PatientIdOrderByUploadDateDesc(patientId)
                .stream()
                .map(r -> MedicalReportDTO.builder()
                        .reportId(r.getReportId())
                        .reportName(r.getReportName())
                        .reportType(r.getReportType())
                        .reportDataUrl(r.getReportDataUrl())
                        .fileSize(r.getFileSize())
                        .uploadDate(r.getUploadDate())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteMedicalReport(Integer reportId, Integer patientId) {
        MedicalReport report = medicalReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));

        if (!report.getPatient().getPatientId().equals(patientId)) {
            throw new IllegalArgumentException("Unauthorized to delete this report");
        }

        medicalReportRepository.delete(report);
    }

    @Override
    @Transactional
    public PrescriptionDTO addConsultationAndPrescription(String doctorId, PrescriptionDTO dto) {
        Appointment appointment = appointmentRepository.findById(dto.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (!appointment.getDoctor().getDoctorId().equals(doctorId)) {
            throw new IllegalArgumentException("Not authorized to add records for this appointment");
        }

        // 1. Create Consultation Record
        ConsultationRecord consultation = ConsultationRecord.builder()
                .appointment(appointment)
                .diagnosis(dto.getDiagnosis())
                .notes(dto.getNotes())
                .hasPrescription(true)
                .build();
        consultation = consultationRepository.save(consultation);

        // 2. Create Text-Based Prescription
        Prescription prescription = Prescription.builder()
                .patient(appointment.getPatient())
                .doctor(appointment.getDoctor())
                .consultation(consultation)
                .diagnosisText(dto.getDiagnosisText())
                .dateIssued(LocalDate.now())
                .build();
        prescription = prescriptionRepository.save(prescription);
        
        // 3. Mark appointment as completed
        appointment.setStatus(Appointment.Status.Completed);
        appointmentRepository.save(appointment);

        dto.setPrescriptionId(prescription.getPrescriptionId());
        dto.setDateIssued(prescription.getDateIssued());
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public PrescriptionDTO getConsultationRecord(Integer appointmentId) {
        ConsultationRecord consultation = consultationRepository.findByAppointment_AppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation record not found for this appointment"));

        PrescriptionDTO dto = PrescriptionDTO.builder()
                .appointmentId(appointmentId)
                .diagnosis(consultation.getDiagnosis())
                .notes(consultation.getNotes())
                .build();
                
        // If there's a prescription, we would fetch it.
        // Assuming relationship setup, but avoiding circular logic here for simplicity.
        return dto;
    }
}
