# 🎬 Movie Ticket Booking System – Microservices

A **Spring Boot Microservices-based Movie Ticket Booking System** developed using **Java 21, Spring Boot, Spring Data JPA, MySQL, REST APIs, OpenFeign, and Swagger**.

The system is divided into four independent microservices, where each service manages its own business logic and database.

---

## 🏗️ Architecture

```text
                    Client / Postman / Swagger
                              |
          ---------------------------------------------
          |              |             |              |
       User Service   Movie Service  Theatre       Booking
         :8081           :8082       Service        Service
                                      :8083          :8084
          |              |             |              |
       user_db         movie_db      theatre_db     booking_db
                                     
                              Booking Service
                           /        |        \
                      Feign       Feign      Feign
                       ↓           ↓          ↓
                     User       Movie      Theatre
                    :8081       :8082       :8083
```

Each microservice has a **separate MySQL database**, following the **Database-per-Service** pattern.

---

# 🧩 Microservices

| Service         | Port | Responsibility                | Database     |
| --------------- | ---: | ----------------------------- | ------------ |
| User Service    | 8081 | User management               | `user_db`    |
| Movie Service   | 8082 | Movie management              | `movie_db`   |
| Theatre Service | 8083 | Theatre & show management     | `theatre_db` |
| Booking Service | 8084 | Ticket booking & cancellation | `booking_db` |

---

# 1. User Service

Manages user registration and user information.

### APIs

| Method | Endpoint          | Description    |
| ------ | ----------------- | -------------- |
| POST   | `/api/users`      | Create user    |
| GET    | `/api/users`      | Get all users  |
| GET    | `/api/users/{id}` | Get user by ID |
| PUT    | `/api/users/{id}` | Update user    |
| DELETE | `/api/users/{id}` | Delete user    |

### User Fields

```text
id, name, email, password, role
```

Database:

```text
user_db → users
```

---

# 2. Movie Service

Manages movie information.

### APIs

| Method | Endpoint                          | Description        |
| ------ | --------------------------------- | ------------------ |
| POST   | `/api/movies`                     | Add movie          |
| GET    | `/api/movies`                     | Get all movies     |
| GET    | `/api/movies/{id}`                | Get movie          |
| PUT    | `/api/movies/{id}`                | Update movie       |
| DELETE | `/api/movies/{id}`                | Delete movie       |
| GET    | `/api/movies/genre/{genre}`       | Search by genre    |
| GET    | `/api/movies/language/{language}` | Search by language |

### Movie Fields

```text
id, title, genre, language, duration,
rating, description, posterUrl
```

Database:

```text
movie_db → movies
```

---

# 3. Theatre Service

Manages theatres and movie shows.

### Theatre APIs

| Method | Endpoint                    | Description      |
| ------ | --------------------------- | ---------------- |
| POST   | `/api/theatres`             | Create theatre   |
| GET    | `/api/theatres`             | Get all theatres |
| GET    | `/api/theatres/{id}`        | Get theatre      |
| GET    | `/api/theatres/city/{city}` | Search by city   |
| PUT    | `/api/theatres/{id}`        | Update theatre   |
| DELETE | `/api/theatres/{id}`        | Delete theatre   |

### Show APIs

| Method | Endpoint                         | Description       |
| ------ | -------------------------------- | ----------------- |
| POST   | `/api/shows`                     | Create show       |
| GET    | `/api/shows`                     | Get all shows     |
| GET    | `/api/shows/{id}`                | Get show          |
| GET    | `/api/shows/movie/{movieId}`     | Get movie shows   |
| GET    | `/api/shows/theatre/{theatreId}` | Get theatre shows |
| DELETE | `/api/shows/{id}`                | Delete show       |

### Main Fields

**Theatre:**

```text
id, name, city, address
```

**Show:**

```text
id, movieId, theatreId, screenName,
totalSeats, showDate, showTime, ticketPrice
```

Database:

```text
theatre_db
├── theatres
└── shows
```

---

# 4. Booking Service

The Booking Service handles ticket booking, seat validation, booking history, and cancellation.

### APIs

| Method | Endpoint                      | Description         |
| ------ | ----------------------------- | ------------------- |
| POST   | `/api/bookings`               | Create booking      |
| GET    | `/api/bookings`               | Get all bookings    |
| GET    | `/api/bookings/{id}`          | Get booking         |
| GET    | `/api/bookings/user/{userId}` | Get user's bookings |
| PUT    | `/api/bookings/{id}/cancel`   | Cancel booking      |

### Booking Fields

```text
id, userId, movieId, showId,
seatNumber, totalAmount, status, bookingDate
```

Database:

```text
booking_db → bookings
```

---

# 🔄 Booking Workflow

When a user books a ticket:

```text
Client
  ↓
Booking Service
  ↓
Check User → User Service
  ↓
Get Show → Theatre Service
  ↓
Get Movie → Movie Service
  ↓
Check Seat Availability
  ↓
Save Booking → booking_db
  ↓
Booking Confirmation
```

The Booking Service uses **OpenFeign** to communicate with the User, Movie, and Theatre services.

For example:

```text
Booking Service
      |
      | GET /api/users/{id}
      ↓
User Service
```

The services communicate through **REST APIs**, not by directly accessing each other's databases.

---

# 🎟️ Seat Booking

Before confirming a booking, the system checks whether the requested seat is already booked for that show.

Example:

```text
Show 1
A1 → CONFIRMED
A2 → CONFIRMED
A3 → AVAILABLE
A4 → AVAILABLE
```

If the user tries to book an already confirmed seat, the system returns:

```text
409 CONFLICT
```

After cancellation, the booking status becomes:

```text
CONFIRMED → CANCELLED
```

---

# 🗄️ MySQL Databases

Four separate databases are used:

```text
MySQL
│
├── user_db
├── movie_db
├── theatre_db
└── booking_db
```

This provides **data isolation and service independence**.

---

# 🛠️ Technologies

* **Java 21**
* **Spring Boot**
* **Spring Web**
* **Spring Data JPA / Hibernate**
* **MySQL**
* **REST API**
* **OpenFeign**
* **Swagger / OpenAPI**
* **Maven**
* **IntelliJ IDEA**
* **Postman**

---

# 📖 Swagger

Swagger documentation is available at:

```text
User:     http://localhost:8081/swagger-ui.html
Movie:    http://localhost:8082/swagger-ui.html
Theatre:  http://localhost:8083/swagger-ui.html
Booking:  http://localhost:8084/swagger-ui.html
```

---

# ▶️ Running the Project

1. Start **MySQL**.
2. Create databases:

```sql
CREATE DATABASE user_db;
CREATE DATABASE movie_db;
CREATE DATABASE theatre_db;
CREATE DATABASE booking_db;
```

3. Configure MySQL username/password in each service's `application.properties`.
4. Start the services in IntelliJ:

```text
UserServiceApplication     → 8081
MovieServiceApplication    → 8082
TheatreServiceApplication  → 8083
BookingServiceApplication  → 8084
```

5. Test APIs using **Swagger or Postman**.

### Recommended Testing Order

```text
Create User
     ↓
Create Movie
     ↓
Create Theatre
     ↓
Create Show
     ↓
Create Booking
     ↓
View Booking
     ↓
Cancel Booking
```

---

# 📌 Key Microservices Concepts Used

* **Independent Microservices**
* **Database-per-Service**
* **RESTful APIs**
* **OpenFeign Inter-Service Communication**
* **Spring Data JPA**
* **Layered Architecture**
* **Swagger API Documentation**
* **Service Independence**
* **CRUD Operations**
* **Seat Availability Validation**
* **Booking and Cancellation Workflow**

---

## 👨‍💻 Project Summary

This project demonstrates how a traditional movie ticket booking application can be divided into independent microservices. Each service owns its data and functionality, while **OpenFeign and REST APIs** enable communication between services. **Spring Boot** provides the microservice framework, **Spring Data JPA/Hibernate** handles database operations, and **MySQL** provides persistent storage.
