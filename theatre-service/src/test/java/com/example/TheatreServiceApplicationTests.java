package com.example;

import com.example.entity.Show;
import com.example.entity.Theatre;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;

class TheatreServiceApplicationTests {

    @Test
    void testTheatreEntityCreation() {
        Theatre theatre = new Theatre(1L, "PVR Palladium", "Mumbai", "Lower Parel");
        assertEquals(1L, theatre.getId());
        assertEquals("PVR Palladium", theatre.getName());
        assertEquals("Mumbai", theatre.getCity());
        assertEquals("Lower Parel", theatre.getAddress());
    }

    @Test
    void testShowEntityCreation() {
        LocalDate date = LocalDate.of(2026, 10, 25);
        LocalTime time = LocalTime.of(19, 30);
        Show show = new Show(1L, 101L, 201L, "IMAX Screen", 100, date, time, 350.0);
        assertEquals(1L, show.getId());
        assertEquals(101L, show.getMovieId());
        assertEquals(201L, show.getTheatreId());
        assertEquals("IMAX Screen", show.getScreenName());
        assertEquals(100, show.getTotalSeats());
        assertEquals(350.0, show.getTicketPrice());
    }
}
