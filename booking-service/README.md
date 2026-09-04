# Booking Service

The Booking Service manages movie ticket bookings,
booking history and cancellations.

It communicates with User Service, Movie Service
and Theatre Service using Spring Cloud OpenFeign.

## Technologies

- Java 21
- Spring Boot
- Spring Data JPA
- MySQL
- Spring Cloud OpenFeign
- Swagger

## Port

8084

## Database

booking_db

## Communication

Booking Service -> User Service

Booking Service -> Movie Service

Booking Service -> Theatre Service

## Endpoints

POST /api/bookings
GET /api/bookings
GET /api/bookings/{id}
GET /api/bookings/user/{userId}
PUT /api/bookings/{id}/cancel

## Swagger

http://localhost:8084/swagger-ui.html