package com.example.controller;

import com.example.dto.BookingRequest;
import com.example.dto.BookingResponse;
import com.example.entity.Booking;
import com.example.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(
            BookingService bookingService) {

        this.bookingService = bookingService;
    }


    @PostMapping
    public ResponseEntity<BookingResponse>
    createBooking(
            @RequestBody BookingRequest request) {

        BookingResponse booking =
                bookingService.createBooking(
                        request
                );

        return new ResponseEntity<>(
                booking,
                HttpStatus.CREATED
        );
    }


    @GetMapping
    public List<Booking> getAllBookings() {

        return bookingService.getAllBookings();
    }


    @GetMapping("/{id}")
    public Booking getBookingById(
            @PathVariable Long id) {

        return bookingService.getBookingById(
                id
        );
    }


    @GetMapping("/user/{userId}")
    public List<Booking> getUserBookings(
            @PathVariable Long userId) {

        return bookingService
                .getBookingsByUser(userId);
    }


    @PutMapping("/{id}/cancel")
    public Booking cancelBooking(
            @PathVariable Long id) {

        return bookingService.cancelBooking(id);
    }
}
