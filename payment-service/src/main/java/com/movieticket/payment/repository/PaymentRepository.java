package com.movieticket.payment.repository;

import com.movieticket.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByBookingId(Long bookingId);

    List<Payment> findByUserId(Long userId);

    Optional<Payment> findByTransactionId(String transactionId);

    List<Payment> findByStatus(String status);
}
