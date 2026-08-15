package com.medibridge.core.service;

import com.medibridge.core.dto.MedicalReportDTO;
import com.medibridge.core.dto.PrescriptionDTO;

import java.util.List;

public interface RecordService {

    // Patient actions
    MedicalReportDTO uploadMedicalReport(Integer patientId, MedicalReportDTO reportDTO);
    List<MedicalReportDTO> getPatientReports(Integer patientId);
    void deleteMedicalReport(Integer reportId, Integer patientId);

    // Doctor actions
    PrescriptionDTO addConsultationAndPrescription(String doctorId, PrescriptionDTO prescriptionDTO);
    PrescriptionDTO getConsultationRecord(Integer appointmentId);
}
