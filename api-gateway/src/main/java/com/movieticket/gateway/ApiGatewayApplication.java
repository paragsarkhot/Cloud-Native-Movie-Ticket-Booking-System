package com.movieticket.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("auth-service", r -> r.path("/api/auth/**", "/api/auth")
                        .uri("http://user-service:8081"))
                .route("user-service", r -> r.path("/api/users/**", "/api/users")
                        .uri("http://user-service:8081"))
                .route("movie-service", r -> r.path("/api/movies/**", "/api/movies")
                        .uri("http://movie-service:8082"))
                .route("theatre-service", r -> r.path("/api/theatres/**", "/api/theatres", "/api/shows/**", "/api/shows")
                        .uri("http://theatre-service:8083"))
                .route("booking-service", r -> r.path("/api/bookings/**", "/api/bookings")
                        .uri("http://booking-service:8084"))
                .route("payment-service", r -> r.path("/api/payments/**", "/api/payments")
                        .uri("http://payment-service:8085"))
                .route("notification-service", r -> r.path("/api/notifications/**", "/api/notifications")
                        .uri("http://notification-service:8086"))
                .route("review-service", r -> r.path("/api/reviews/**", "/api/reviews")
                        .uri("http://review-service:8087"))
                .route("analytics-service", r -> r.path("/api/analytics/**", "/api/analytics")
                        .uri("http://analytics-service:8088"))
                .build();
    }
}
