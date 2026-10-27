package com.movieticket.payment;

import com.movieticket.payment.dto.PaymentRequest;
import com.movieticket.payment.entity.Payment;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PaymentServiceApplicationTests {

    @Test
    void testPaymentEntityCreation() {
        Payment payment = new Payment();
        payment.setBookingId(10L);
        payment.setUserId(100L);
        payment.setAmount(500.0);
        payment.setPaymentMethod("UPI");
        payment.setStatus("PENDING");

        assertEquals(10L, payment.getBookingId());
        assertEquals(100L, payment.getUserId());
        assertEquals(500.0, payment.getAmount());
        assertEquals("UPI", payment.getPaymentMethod());
        assertEquals("PENDING", payment.getStatus());
    }

    @Test
    void testPaymentRequestDto() {
        PaymentRequest req = new PaymentRequest();
        req.setBookingId(1L);
        req.setUserId(2L);
        req.setAmount(350.0);
        req.setPaymentMethod("CREDIT_CARD");

        assertEquals(1L, req.getBookingId());
        assertEquals(2L, req.getUserId());
        assertEquals(350.0, req.getAmount());
        assertEquals("CREDIT_CARD", req.getPaymentMethod());
    }
}
