package com.medibridge.core.repository;

import com.medibridge.core.model.MedicalReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicalReportRepository extends JpaRepository<MedicalReport, Integer> {
    java.util.List<MedicalReport> findByPatient_PatientIdOrderByUploadDateDesc(Integer patientId);
}

