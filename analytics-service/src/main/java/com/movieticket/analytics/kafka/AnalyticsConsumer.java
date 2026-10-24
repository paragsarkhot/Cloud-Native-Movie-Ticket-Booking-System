package com.movieticket.analytics.kafka;

import com.movieticket.analytics.service.AnalyticsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class AnalyticsConsumer {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsConsumer.class);

    private final AnalyticsService analyticsService;

    public AnalyticsConsumer(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @KafkaListener(topics = "booking-events", groupId = "analytics-group")
    public void handleBookingEvent(String message) {
        log.info("Analytics received booking event: {}", message);

        try {
            // Message format: "EVENT_TYPE|userId|bookingId|movieId|amount"
            String[] parts = message.split("\\|");
            String eventType = parts[0];
            Long userId = Long.parseLong(parts[1]);
            Long bookingId = Long.parseLong(parts[2]);
            Long movieId = parts.length > 3 ? Long.parseLong(parts[3]) : null;
            Double amount = parts.length > 4 ? Double.parseDouble(parts[4]) : null;

            analyticsService.recordEvent(eventType, bookingId, userId, movieId, amount);
            log.info("Analytics event recorded: {} for booking {}", eventType, bookingId);

        } catch (Exception e) {
            log.error("Error processing booking event for analytics: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "payment-events", groupId = "analytics-group")
    public void handlePaymentEvent(String message) {
        log.info("Analytics received payment event: {}", message);

        try {
            String[] parts = message.split("\\|");
            String eventType = parts[0];
            Long userId = Long.parseLong(parts[1]);
            Double amount = Double.parseDouble(parts[2]);
            Long bookingId = parts.length > 3 ? Long.parseLong(parts[3]) : null;

            analyticsService.recordEvent(eventType, bookingId, userId, null, amount);
            log.info("Analytics payment event recorded: {}", eventType);

        } catch (Exception e) {
            log.error("Error processing payment event for analytics: {}", e.getMessage());
        }
    }
}
