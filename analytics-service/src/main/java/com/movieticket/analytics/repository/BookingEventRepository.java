package com.movieticket.analytics.repository;

import com.movieticket.analytics.entity.BookingEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingEventRepository extends JpaRepository<BookingEvent, Long> {

    List<BookingEvent> findByEventDateBetween(LocalDateTime start, LocalDateTime end);

    List<BookingEvent> findByEventType(String eventType);

    @Query("SELECT SUM(e.amount) FROM BookingEvent e WHERE e.eventType = 'PAYMENT_COMPLETED' AND e.eventDate BETWEEN :start AND :end")
    Double findTotalRevenueBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT e.movieId, COUNT(e) as cnt FROM BookingEvent e WHERE e.eventType = 'BOOKING_CREATED' GROUP BY e.movieId ORDER BY cnt DESC")
    List<Object[]> findPopularMovies();

    @Query("SELECT COUNT(e) FROM BookingEvent e WHERE e.eventType = 'BOOKING_CREATED' AND e.eventDate BETWEEN :start AND :end")
    Long countBookingsBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(DISTINCT e.userId) FROM BookingEvent e")
    Long countDistinctUsers();
}
