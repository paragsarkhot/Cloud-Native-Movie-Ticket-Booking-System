package com.movieticket.analytics.service;

import com.movieticket.analytics.entity.BookingEvent;
import com.movieticket.analytics.repository.BookingEventRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final BookingEventRepository bookingEventRepository;

    public AnalyticsService(BookingEventRepository bookingEventRepository) {
        this.bookingEventRepository = bookingEventRepository;
    }

    public void recordEvent(String eventType, Long bookingId, Long userId, Long movieId, Double amount) {
        BookingEvent event = new BookingEvent();
        event.setEventType(eventType);
        event.setBookingId(bookingId);
        event.setUserId(userId);
        event.setMovieId(movieId);
        event.setAmount(amount);
        event.setEventDate(LocalDateTime.now());
        bookingEventRepository.save(event);
    }

    public Map<String, Object> getDailyBookings(LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);

        Long count = bookingEventRepository.countBookingsBetween(start, end);

        Map<String, Object> result = new HashMap<>();
        result.put("date", date.toString());
        result.put("totalBookings", count != null ? count : 0);
        return result;
    }

    public Map<String, Object> getRevenue(LocalDate from, LocalDate to) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.atTime(LocalTime.MAX);

        Double revenue = bookingEventRepository.findTotalRevenueBetween(start, end);

        Map<String, Object> result = new HashMap<>();
        result.put("from", from.toString());
        result.put("to", to.toString());
        result.put("totalRevenue", revenue != null ? revenue : 0.0);
        return result;
    }

    public List<Map<String, Object>> getPopularMovies() {
        List<Object[]> results = bookingEventRepository.findPopularMovies();

        return results.stream()
                .limit(10)
                .map(row -> {
                    Map<String, Object> movie = new HashMap<>();
                    movie.put("movieId", row[0]);
                    movie.put("bookingCount", row[1]);
                    return movie;
                })
                .collect(Collectors.toList());
    }

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEvents", bookingEventRepository.count());
        stats.put("totalUsers", bookingEventRepository.countDistinctUsers());
        stats.put("totalBookings",
                bookingEventRepository.findByEventType("BOOKING_CREATED").size());
        stats.put("totalCancellations",
                bookingEventRepository.findByEventType("BOOKING_CANCELLED").size());
        return stats;
    }
}
