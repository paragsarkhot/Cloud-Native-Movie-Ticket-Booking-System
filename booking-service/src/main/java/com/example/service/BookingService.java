package com.example.service;

import com.example.client.MovieClient;
import com.example.client.TheatreClient;
import com.example.client.UserClient;
import com.example.dto.*;
import com.example.entity.Booking;
import com.example.repository.BookingRepository;
import feign.FeignException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;

    private final UserClient userClient;

    private final TheatreClient theatreClient;

    private final MovieClient movieClient;

    public BookingService(
            BookingRepository bookingRepository,
            UserClient userClient,
            TheatreClient theatreClient,
            MovieClient movieClient) {

        this.bookingRepository = bookingRepository;
        this.userClient = userClient;
        this.theatreClient = theatreClient;
        this.movieClient = movieClient;
    }

    public BookingResponse createBooking(
            BookingRequest request) {

        UserDTO user;

        ShowDTO show;

        MovieDTO movie;

        /*
         * STEP 1:
         * Verify user using USER SERVICE.
         */
        try {

            user = userClient.getUserById(
                    request.getUserId()
            );

        } catch (FeignException e) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid user ID"
            );
        }


        /*
         * STEP 2:
         * Get show from THEATRE SERVICE.
         */
        try {

            show = theatreClient.getShowById(
                    request.getShowId()
            );

        } catch (FeignException e) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid show ID"
            );
        }


        /*
         * STEP 3:
         * Get movie ID from Show,
         * then call MOVIE SERVICE.
         */
        try {

            movie = movieClient.getMovieById(
                    show.getMovieId()
            );

        } catch (FeignException e) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Movie for this show does not exist"
            );
        }


        /*
         * STEP 4:
         * Check seat is valid.
         */
        if (request.getSeatNumber() == null ||
                request.getSeatNumber().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Seat number is required"
            );
        }


        /*
         * STEP 5:
         * Prevent same seat from being booked twice.
         */
        boolean alreadyBooked =
                bookingRepository
                        .existsByShowIdAndSeatNumberAndStatus(
                                request.getShowId(),
                                request.getSeatNumber(),
                                "CONFIRMED"
                        );

        if (alreadyBooked) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Seat " +
                            request.getSeatNumber() +
                            " is already booked"
            );
        }


        /*
         * STEP 6:
         * Create booking.
         */
        Booking booking = new Booking();

        booking.setUserId(
                request.getUserId()
        );

        booking.setShowId(
                request.getShowId()
        );

        booking.setMovieId(
                show.getMovieId()
        );

        booking.setSeatNumber(
                request.getSeatNumber()
                        .toUpperCase()
        );

        /*
         * Price comes from Theatre Service.
         * User cannot send their own price.
         */
        booking.setTotalAmount(
                show.getTicketPrice()
        );

        booking.setStatus(
                "CONFIRMED"
        );

        booking.setBookingDate(
                LocalDateTime.now()
        );


        /*
         * STEP 7:
         * Save to Booking DB.
         */
        Booking saved =
                bookingRepository.save(booking);


        /*
         * STEP 8:
         * Build response containing data
         * from different microservices.
         */
        return createResponse(
                saved,
                user,
                movie
        );
    }


    public Booking getBookingById(Long id) {

        return bookingRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Booking not found"
                        )
                );
    }


    public List<Booking> getAllBookings() {

        return bookingRepository.findAll();
    }


    public List<Booking> getBookingsByUser(
            Long userId) {

        return bookingRepository.findByUserId(
                userId
        );
    }


    public Booking cancelBooking(Long id) {

        Booking booking =
                getBookingById(id);

        if ("CANCELLED".equals(
                booking.getStatus())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Booking is already cancelled"
            );
        }

        booking.setStatus(
                "CANCELLED"
        );

        return bookingRepository.save(
                booking
        );
    }


    private BookingResponse createResponse(
            Booking booking,
            UserDTO user,
            MovieDTO movie) {

        BookingResponse response =
                new BookingResponse();

        response.setBookingId(
                booking.getId()
        );

        response.setCustomerName(
                user.getName()
        );

        response.setMovieTitle(
                movie.getTitle()
        );

        response.setShowId(
                booking.getShowId()
        );

        response.setSeatNumber(
                booking.getSeatNumber()
        );

        response.setTotalAmount(
                booking.getTotalAmount()
        );

        response.setStatus(
                booking.getStatus()
        );

        response.setBookingDate(
                booking.getBookingDate()
        );

        return response;
    }
}
