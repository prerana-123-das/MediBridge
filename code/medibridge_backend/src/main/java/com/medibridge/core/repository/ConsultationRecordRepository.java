package com.medibridge.core.repository;

import com.medibridge.core.model.ConsultationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConsultationRecordRepository extends JpaRepository<ConsultationRecord, Integer> {
    java.util.Optional<ConsultationRecord> findByAppointment_AppointmentId(Integer appointmentId);
}

