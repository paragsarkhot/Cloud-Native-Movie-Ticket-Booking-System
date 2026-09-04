package com.example.dto;



import java.time.LocalDateTime;

public class BookingResponse {

    private Long bookingId;

    private String customerName;

    private String movieTitle;

    private Long showId;

    private String seatNumber;

    private Double totalAmount;

    private String status;

    private LocalDateTime bookingDate;

    public BookingResponse() {
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(
            String customerName) {

        this.customerName = customerName;
    }

    public String getMovieTitle() {
        return movieTitle;
    }

    public void setMovieTitle(
            String movieTitle) {

        this.movieTitle = movieTitle;
    }

    public Long getShowId() {
        return showId;
    }

    public void setShowId(Long showId) {
        this.showId = showId;
    }

    public String getSeatNumber() {
        return seatNumber;
    }

    public void setSeatNumber(
            String seatNumber) {

        this.seatNumber = seatNumber;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(
            Double totalAmount) {

        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(
            LocalDateTime bookingDate) {

        this.bookingDate = bookingDate;
    }
}
