package com.movieticket.analytics.controller;

import com.movieticket.analytics.service.AnalyticsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/bookings/daily")
    public Map<String, Object> getDailyBookings(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        if (date == null) date = LocalDate.now();
        return analyticsService.getDailyBookings(date);
    }

    @GetMapping("/revenue")
    public Map<String, Object> getRevenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        return analyticsService.getRevenue(from, to);
    }

    @GetMapping("/movies/popular")
    public List<Map<String, Object>> getPopularMovies() {
        return analyticsService.getPopularMovies();
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        return analyticsService.getStats();
    }
}
