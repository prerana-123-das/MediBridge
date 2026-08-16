package com.medibridge.core.repository;

import com.medibridge.core.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {
    java.util.List<Appointment> findByPatient_PatientIdOrderByAppointmentDateDesc(Integer patientId);
    java.util.List<Appointment> findByDoctor_DoctorIdOrderByAppointmentDateDesc(String doctorId);
    java.util.List<Appointment> findByDoctor_DoctorIdAndAppointmentDateBetween(String doctorId, java.time.LocalDateTime start, java.time.LocalDateTime end);
    long countByPatient_PatientId(Integer patientId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT a.patient.patientId) FROM Appointment a WHERE a.doctor.doctorId = :doctorId")
    long countDistinctPatientsByDoctorId(@org.springframework.data.repository.query.Param("doctorId") String doctorId);

    boolean existsByPatient_PatientIdAndDoctor_DoctorIdAndReasonIgnoreCase(Integer patientId, String doctorId, String reason);

    long countByAppointmentDateBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);
    long countByAppointmentDateBetweenAndStatus(java.time.LocalDateTime start, java.time.LocalDateTime end, Appointment.Status status);
}

