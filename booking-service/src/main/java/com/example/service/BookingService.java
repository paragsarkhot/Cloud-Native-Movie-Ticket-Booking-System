package com.example.service;

import com.example.client.MovieClient;
import com.example.client.TheatreClient;
import com.example.client.UserClient;
import com.example.dto.*;
import com.example.entity.Booking;
import com.example.repository.BookingRepository;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    private final BookingRepository bookingRepository;
    private final UserClient userClient;
    private final TheatreClient theatreClient;
    private final MovieClient movieClient;

    @Autowired(required = false)
    private KafkaTemplate<String, String> kafkaTemplate;

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

    public BookingResponse createBooking(BookingRequest request) {

        UserDTO user;
        ShowDTO show;
        MovieDTO movie;

        /*
         * STEP 1: Verify user using USER SERVICE.
         */
        try {
            user = userClient.getUserById(request.getUserId());
        } catch (FeignException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid user ID");
        }

        /*
         * STEP 2: Get show from THEATRE SERVICE.
         */
        try {
            show = theatreClient.getShowById(request.getShowId());
        } catch (FeignException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid show ID");
        }

        /*
         * STEP 3: Get movie ID from Show, then call MOVIE SERVICE.
         */
        try {
            movie = movieClient.getMovieById(show.getMovieId());
        } catch (FeignException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Movie for this show does not exist");
        }

        /*
         * STEP 4: Parse & validate seat list (supports single or multiple seats).
         */
        List<String> seatsToBook;
        if (request.getSeatNumbers() != null && !request.getSeatNumbers().isEmpty()) {
            seatsToBook = request.getSeatNumbers().stream()
                    .map(String::trim)
                    .map(String::toUpperCase)
                    .filter(s -> !s.isBlank())
                    .distinct()
                    .toList();
        } else if (request.getSeatNumber() != null && !request.getSeatNumber().isBlank()) {
            seatsToBook = Arrays.stream(request.getSeatNumber().split(","))
                    .map(String::trim)
                    .map(String::toUpperCase)
                    .filter(s -> !s.isBlank())
                    .distinct()
                    .toList();
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one seat number is required");
        }

        if (seatsToBook.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one seat number is required");
        }

        /*
         * STEP 5: Prevent already booked seats from being booked again.
         */
        List<String> currentlyBooked = getBookedSeatsByShow(request.getShowId());
        for (String seat : seatsToBook) {
            if (currentlyBooked.contains(seat)) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Seat " + seat + " is already booked"
                );
            }
        }

        /*
         * STEP 6: Create booking entity with all selected seats and calculate total amount.
         */
        String joinedSeats = String.join(", ", seatsToBook);
        double ticketPrice = (show.getTicketPrice() != null) ? show.getTicketPrice() : 0.0;
        double totalAmount = ticketPrice * seatsToBook.size();

        Booking booking = new Booking();
        booking.setUserId(request.getUserId());
        booking.setShowId(request.getShowId());
        booking.setMovieId(show.getMovieId());
        booking.setSeatNumber(joinedSeats);
        booking.setTotalAmount(totalAmount);
        booking.setStatus("CONFIRMED");
        booking.setBookingDate(LocalDateTime.now());

        /*
         * STEP 7: Save to Booking DB & publish Kafka event.
         */
        Booking saved = bookingRepository.save(booking);
        publishEvent("BOOKING_CREATED", saved.getUserId(), saved.getId(), saved.getMovieId(), saved.getTotalAmount());

        /*
         * STEP 8: Build and return composite response.
         */
        return createResponse(saved, user, movie);
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    public List<Booking> getBookingsByShow(Long showId) {
        return bookingRepository.findByShowId(showId);
    }

    public List<String> getBookedSeatsByShow(Long showId) {
        return bookingRepository.findByShowId(showId).stream()
                .filter(b -> "CONFIRMED".equalsIgnoreCase(b.getStatus()))
                .flatMap(b -> Arrays.stream(b.getSeatNumber().split(",")))
                .map(String::trim)
                .map(String::toUpperCase)
                .filter(s -> !s.isBlank())
                .distinct()
                .toList();
    }

    public Booking cancelBooking(Long id) {
        Booking booking = getBookingById(id);

        if ("CANCELLED".equals(booking.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking is already cancelled");
        }

        booking.setStatus("CANCELLED");
        Booking saved = bookingRepository.save(booking);

        publishEvent("BOOKING_CANCELLED", saved.getUserId(), saved.getId(), saved.getMovieId(), saved.getTotalAmount());
        return saved;
    }

    private void publishEvent(String eventType, Long userId, Long bookingId, Long movieId, Double amount) {
        if (kafkaTemplate != null) {
            try {
                String payload = String.format("%s|%d|%d|%d|%.2f", eventType, userId, bookingId, movieId != null ? movieId : 0, amount != null ? amount : 0.0);
                kafkaTemplate.send("booking-events", payload);
                log.info("Sent event to Kafka [booking-events]: {}", payload);
            } catch (Exception e) {
                log.warn("Failed to publish Kafka event: {}", e.getMessage());
            }
        }
    }

    private BookingResponse createResponse(Booking booking, UserDTO user, MovieDTO movie) {
        BookingResponse response = new BookingResponse();
        response.setBookingId(booking.getId());
        response.setCustomerName(user.getName());
        response.setMovieTitle(movie.getTitle());
        response.setShowId(booking.getShowId());
        response.setSeatNumber(booking.getSeatNumber());
        response.setTotalAmount(booking.getTotalAmount());
        response.setStatus(booking.getStatus());
        response.setBookingDate(booking.getBookingDate());
        return response;
    }
}
