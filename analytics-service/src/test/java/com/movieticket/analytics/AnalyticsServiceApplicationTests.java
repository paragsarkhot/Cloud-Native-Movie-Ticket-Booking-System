package com.movieticket.analytics;

import com.movieticket.analytics.entity.BookingEvent;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class AnalyticsServiceApplicationTests {

    @Test
    void testBookingEventEntityCreation() {
        BookingEvent event = new BookingEvent();
        event.setUserId(1L);
        event.setBookingId(100L);
        event.setMovieId(50L);
        event.setAmount(700.0);
        event.setEventType("BOOKING_CREATED");
        event.setEventDate(LocalDateTime.now());

        assertEquals(1L, event.getUserId());
        assertEquals(100L, event.getBookingId());
        assertEquals(50L, event.getMovieId());
        assertEquals(700.0, event.getAmount());
        assertEquals("BOOKING_CREATED", event.getEventType());
    }
}
