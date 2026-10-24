package com.movieticket.payment.service;

import com.movieticket.payment.dto.PaymentRequest;
import com.movieticket.payment.dto.PaymentResponse;
import com.movieticket.payment.entity.Payment;
import com.movieticket.payment.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;

    @Autowired(required = false)
    private KafkaTemplate<String, String> kafkaTemplate;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public PaymentResponse processPayment(PaymentRequest request) {

        // Check if payment already exists for this booking
        paymentRepository.findByBookingId(request.getBookingId())
                .ifPresent(p -> {
                    if ("COMPLETED".equals(p.getStatus())) {
                        throw new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "Payment already completed for this booking"
                        );
                    }
                });

        Payment payment = new Payment();
        payment.setBookingId(request.getBookingId());
        payment.setUserId(request.getUserId());
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setTransactionId(UUID.randomUUID().toString());
        payment.setStatus("COMPLETED");
        payment.setPaymentDate(LocalDateTime.now());

        Payment saved = paymentRepository.save(payment);
        publishPaymentEvent("PAYMENT_COMPLETED", saved.getUserId(), saved.getAmount(), saved.getBookingId());
        return toResponse(saved);
    }

    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Payment not found with ID: " + id
                ));
    }

    public Payment getPaymentByBookingId(Long bookingId) {
        return paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Payment not found for booking: " + bookingId
                ));
    }

    public List<Payment> getPaymentsByUserId(Long userId) {
        return paymentRepository.findByUserId(userId);
    }

    public PaymentResponse refundPayment(Long id) {

        Payment payment = getPaymentById(id);

        if (!"COMPLETED".equals(payment.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only completed payments can be refunded"
            );
        }

        payment.setStatus("REFUNDED");
        payment.setRefundDate(LocalDateTime.now());

        Payment saved = paymentRepository.save(payment);
        publishPaymentEvent("PAYMENT_REFUNDED", saved.getUserId(), saved.getAmount(), saved.getBookingId());
        return toResponse(saved);
    }

    private void publishPaymentEvent(String eventType, Long userId, Double amount, Long bookingId) {
        if (kafkaTemplate != null) {
            try {
                String payload = String.format("%s|%d|%.2f|%d", eventType, userId, amount != null ? amount : 0.0, bookingId != null ? bookingId : 0);
                kafkaTemplate.send("payment-events", payload);
                log.info("Sent event to Kafka [payment-events]: {}", payload);
            } catch (Exception e) {
                log.warn("Failed to publish Kafka payment event: {}", e.getMessage());
            }
        }
    }

    private PaymentResponse toResponse(Payment payment) {
        PaymentResponse response = new PaymentResponse();
        response.setPaymentId(payment.getId());
        response.setBookingId(payment.getBookingId());
        response.setAmount(payment.getAmount());
        response.setPaymentMethod(payment.getPaymentMethod());
        response.setTransactionId(payment.getTransactionId());
        response.setStatus(payment.getStatus());
        response.setPaymentDate(payment.getPaymentDate());
        return response;
    }
}
