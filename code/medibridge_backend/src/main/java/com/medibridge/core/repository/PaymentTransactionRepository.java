package com.medibridge.core.repository;

import com.medibridge.core.model.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Integer> {
    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(p.amount), 0) FROM PaymentTransaction p WHERE p.transactionStatus = 'Paid' AND p.appointment.appointmentType = 'Consultation'")
    java.math.BigDecimal sumConsultationRevenue();

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(p.amount), 0) FROM PaymentTransaction p WHERE p.transactionStatus = 'Paid' AND p.appointment.appointmentType = 'Follow-up'")
    java.math.BigDecimal sumFollowUpRevenue();
}
