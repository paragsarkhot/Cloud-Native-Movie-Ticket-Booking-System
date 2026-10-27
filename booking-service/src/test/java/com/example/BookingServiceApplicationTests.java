package com.example;

import com.example.dto.BookingRequest;
import com.example.dto.BookingResponse;
import com.example.entity.Booking;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class BookingServiceApplicationTests {

    @Test
    void testBookingEntityCreation() {
        Booking booking = new Booking();
        booking.setId(1L);
        booking.setUserId(2L);
        booking.setShowId(3L);
        booking.setMovieId(4L);
        booking.setSeatNumber("A1, A2");
        booking.setTotalAmount(700.0);
        booking.setStatus("CONFIRMED");

        assertEquals(1L, booking.getId());
        assertEquals(2L, booking.getUserId());
        assertEquals(3L, booking.getShowId());
        assertEquals(4L, booking.getMovieId());
        assertEquals("A1, A2", booking.getSeatNumber());
        assertEquals(700.0, booking.getTotalAmount());
        assertEquals("CONFIRMED", booking.getStatus());
    }

    @Test
    void testBookingRequestMultiSeat() {
        BookingRequest request = new BookingRequest();
        request.setUserId(1L);
        request.setShowId(10L);
        request.setSeatNumbers(List.of("B1", "B2", "B3"));

        assertEquals(1L, request.getUserId());
        assertEquals(10L, request.getShowId());
        assertEquals(3, request.getSeatNumbers().size());
        assertTrue(request.getSeatNumbers().contains("B2"));
    }

    @Test
    void testBookingResponseDto() {
        BookingResponse res = new BookingResponse();
        res.setBookingId(100L);
        res.setCustomerName("Parag Sarkhot");
        res.setMovieTitle("Inception");
        res.setSeatNumber("A1, A2");
        res.setTotalAmount(700.0);
        res.setStatus("CONFIRMED");
        res.setBookingDate(LocalDateTime.now());

        assertEquals(100L, res.getBookingId());
        assertEquals("Parag Sarkhot", res.getCustomerName());
        assertEquals("Inception", res.getMovieTitle());
        assertEquals("A1, A2", res.getSeatNumber());
        assertEquals(700.0, res.getTotalAmount());
        assertEquals("CONFIRMED", res.getStatus());
    }
}
