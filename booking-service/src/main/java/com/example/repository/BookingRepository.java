package com.example.repository;

import com.example.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository
        extends JpaRepository<Booking, Long> {

    boolean existsByShowIdAndSeatNumberAndStatus(
            Long showId,
            String seatNumber,
            String status
    );

    List<Booking> findByUserId(Long userId);

    List<Booking> findByShowId(Long showId);
}
