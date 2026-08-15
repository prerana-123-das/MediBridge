package com.medibridge.core.service;

import java.io.ByteArrayInputStream;

public interface PdfExportService {

    ByteArrayInputStream generatePrescriptionPdf(Integer prescriptionId);
    
    ByteArrayInputStream generatePatientHistoryPdf(Integer patientId);
}
