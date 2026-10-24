package com.movieticket.notification.kafka;

import com.movieticket.notification.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class NotificationConsumer {

    private static final Logger log = LoggerFactory.getLogger(NotificationConsumer.class);

    private final NotificationService notificationService;

    public NotificationConsumer(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @KafkaListener(topics = "booking-events", groupId = "notification-group")
    public void handleBookingEvent(String message) {
        log.info("Received booking event: {}", message);

        try {
            // Message format: "EVENT_TYPE|userId|bookingId|details"
            String[] parts = message.split("\\|");
            String eventType = parts[0];
            Long userId = Long.parseLong(parts[1]);
            String bookingId = parts[2];

            String notificationMessage = switch (eventType) {
                case "BOOKING_CREATED" ->
                        "Your booking #" + bookingId + " has been confirmed! Enjoy your movie.";
                case "BOOKING_CANCELLED" ->
                        "Your booking #" + bookingId + " has been cancelled.";
                default ->
                        "Update on your booking #" + bookingId;
            };

            notificationService.createNotification(userId, eventType, notificationMessage);
            log.info("Notification created for user {} - {}", userId, eventType);

        } catch (Exception e) {
            log.error("Error processing booking event: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "payment-events", groupId = "notification-group")
    public void handlePaymentEvent(String message) {
        log.info("Received payment event: {}", message);

        try {
            String[] parts = message.split("\\|");
            String eventType = parts[0];
            Long userId = Long.parseLong(parts[1]);
            String amount = parts[2];

            String notificationMessage = switch (eventType) {
                case "PAYMENT_COMPLETED" ->
                        "Payment of ₹" + amount + " received successfully.";
                case "PAYMENT_REFUNDED" ->
                        "Refund of ₹" + amount + " has been initiated.";
                default ->
                        "Payment update: " + eventType;
            };

            notificationService.createNotification(userId, eventType, notificationMessage);
            log.info("Payment notification created for user {}", userId);

        } catch (Exception e) {
            log.error("Error processing payment event: {}", e.getMessage());
        }
    }
}
