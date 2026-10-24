# 🎬 Cloud-Native Movie Ticket Booking System

A distributed **Movie Ticket Booking Platform** built with **Java 21, Spring Boot 4, Spring Cloud, Apache Kafka, Redis/MySQL, Docker Compose, Jenkins CI/CD, and a modern React Frontend**.

Tested and verified on **macOS Apple Silicon (M2 / ARM64)**.

---

## 🏗️ Architecture Overview

```
                            Client (React SPA :3000)
                                      │
                                      ▼
                        Spring Cloud API Gateway (:8080)
                                      │
                        Eureka Service Discovery (:8761)
                                      │
      ┌───────────┬───────────┬───────┴───┬───────────┬───────────┐
      │           │           │           │           │           │
     User       Movie      Theatre     Booking     Payment     Review
   Service     Service     Service     Service     Service    Service
    :8081       :8082       :8083       :8084       :8085      :8087
      │           │           │           │           │           │
   user_db     movie_db    theatre_db  booking_db  payment_db  review_db
                                          │           │
                                      Kafka Events (booking-events, payment-events)
                                          │           │
                                  ┌───────┴───────────┴───────┐
                                  │                           │
                             Notification                  Analytics
                               Service                      Service
                                :8086                        :8088
                                  │                           │
                           notification_db               analytics_db
```

---

## 🧩 Services Catalog

| Component | Port | Description | Database / Technology |
|---|---|---|---|
| **Eureka Server** | `8761` | Service Registry & Discovery | Netflix Eureka Server |
| **API Gateway** | `8080` | Unified Entrypoint, CORS, Routing | Spring Cloud Gateway WebFlux |
| **User & Auth** | `8081` | JWT Registration, Login, Roles | `user_db` + Spring Security + JJWT |
| **Movie Service** | `8082` | Movie Catalog, Genres, Languages | `movie_db` + Spring Data JPA |
| **Theatre Service** | `8083` | Theatres, Screens, Shows, Timings | `theatre_db` + Spring Data JPA |
| **Booking Service** | `8084` | Seat Booking, Cancellation, Kafka | `booking_db` + OpenFeign + Kafka |
| **Payment Service** | `8085` | Payment Transactions, Refunds | `payment_db` + Kafka Producer |
| **Notification** | `8086` | Real-time notifications on events | `notification_db` + Kafka Consumer |
| **Review Service** | `8087` | User ratings & movie reviews | `review_db` + Spring Data JPA |
| **Analytics Service** | `8088` | Aggregated reports & statistics | `analytics_db` + Kafka Consumer |
| **React Frontend** | `3000` | Modern responsive UI, Seat Matrix | React 18, Nginx |
| **Jenkins CI/CD** | `8089` | Automated testing & container builds | Jenkins LTS + Docker CLI |
| **Apache Kafka** | `9092` | Distributed event streaming | Confluent Kafka + Zookeeper |
| **MySQL 8** | `3306` | Isolated database per service | Auto-provisioned by `docker-compose` |

---

## 🚀 Quick Start with Docker Compose

Running the entire system (all 8 microservices, Eureka, Gateway, MySQL, Kafka, Jenkins, and Frontend) takes a single command:

```bash
# 1. Clone or navigate to the repository
cd /Users/paragsarkhot/Documents/MovieTicket

# 2. Build and launch all services with Docker Compose
docker compose up -d --build
```

### Checking Status
```bash
docker compose ps
```

### Accessing Interfaces:
- **React Frontend**: [http://localhost:3000](http://localhost:3000)
- **API Gateway**: [http://localhost:8080](http://localhost:8080)
- **Eureka Dashboard**: [http://localhost:8761](http://localhost:8761)
- **Jenkins CI/CD Dashboard**: [http://localhost:8089](http://localhost:8089)

---

## 🛠️ Step-by-Step Jenkins CI/CD Setup on Docker

When you run `docker compose up`, Jenkins automatically boots on port `8089` inside Docker, with Docker-in-Docker capabilities and Maven pre-installed.

### Step 1: Retrieve Initial Admin Password
```bash
docker exec -it movieticket-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```
Copy the printed password hash.

### Step 2: Complete Web Setup
1. Open [http://localhost:8089](http://localhost:8089) in your browser.
2. Paste the admin password and click **Continue**.
3. Select **Install suggested plugins** (includes Git, Pipeline, etc.).
4. Create your Admin user (e.g. `admin` / `admin123`).

### Step 3: Verify Required Jenkins Plugins
Ensure these plugins are installed (**Manage Jenkins** ➔ **Plugins** ➔ **Installed plugins**):
- **Git Plugin**
- **Pipeline**
- **GitHub Integration Plugin**
- **JUnit Plugin** (for test reporting)

### Step 4: Configure GitHub Webhook for Automatic Rebuilds
To automatically trigger the pipeline whenever you push code to GitHub:
1. Go to your GitHub repository: `https://github.com/<your-user>/<repo>/settings/hooks`
2. Click **Add webhook**.
3. Set **Payload URL**: `http://<your-public-ip-or-ngrok>:8089/github-webhook/`
   > *Note for local dev without public IP*: You can expose your local port `8089` using `ngrok http 8089` or Smee.io, OR use the built-in `pollSCM('H/5 * * * *')` which polls GitHub every 5 minutes automatically.
4. Set **Content type**: `application/json`
5. Select **Just the push event** and click **Add webhook**.

### Step 5: Create the Jenkins Pipeline Job
1. In Jenkins, click **New Item**.
2. Name it `MovieTicket-Pipeline` and choose **Pipeline**. Click **OK**.
3. Scroll down to **Build Triggers**:
   - Check ☑️ **GitHub hook trigger for GITScm polling**.
   - Check ☑️ **Poll SCM** (schedule: `H/5 * * * *`).
4. Under **Pipeline**:
   - Definition: **Pipeline script from SCM**
   - SCM: **Git**
   - Repository URL: `https://github.com/<your-user>/<your-repo>.git`
   - Branch Specifier: `*/main` or `*/master`
   - Script Path: `Jenkinsfile`
5. Click **Save** and click **Build Now** to run your first build!
6. Any future `git push` to your GitHub repo will automatically trigger:
   - Git checkout
   - Unit tests execution (`mvn clean test`)
   - Test report generation
   - JAR packaging
   - Docker image rebuilds

---

## 💻 Local Development (IntelliJ IDEA & Terminal)

You can also run services locally inside IntelliJ IDEA:

### 1. Start Infrastructure Only
```bash
docker compose up -d mysql kafka zookeeper
```

### 2. Run Root Maven Build
```bash
mvn clean test-compile -DskipTests
```

### 3. Service Startup Sequence in IntelliJ:
1. `EurekaServerApplication` (Port 8761)
2. `ApiGatewayApplication` (Port 8080)
3. `UserServiceApplication` (Port 8081)
4. `MovieServiceApplication` (Port 8082)
5. `TheatreServiceApplication` (Port 8083)
6. `BookingServiceApplication` (Port 8084)
7. `PaymentServiceApplication` (Port 8085)
8. `NotificationServiceApplication` (Port 8086)
9. `ReviewServiceApplication` (Port 8087)
10. `AnalyticsServiceApplication` (Port 8088)

### 4. Run React Frontend Locally:
```bash
cd frontend
npm install
npm start
```
Frontend runs at `http://localhost:3000`.

---

## 🔑 Key API Endpoints (via API Gateway :8080)

### 👤 Authentication & Users (`/api/auth`, `/api/users`)
- `POST /api/auth/register` — Register new user with hashed password
- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET /api/auth/validate?token=...` — Verify JWT token validity
- `GET /api/users` — List all users
- `GET /api/users/{id}` — Get user by ID

### 🎬 Movies (`/api/movies`)
- `POST /api/movies` — Create movie
- `GET /api/movies` — List all movies
- `GET /api/movies/{id}` — Get movie details
- `GET /api/movies/genre/{genre}` — Filter by genre
- `GET /api/movies/language/{language}` — Filter by language

### 🏛️ Theatres & Shows (`/api/theatres`, `/api/shows`)
- `GET /api/theatres` — List all theatres
- `POST /api/theatres` — Add new theatre
- `GET /api/shows/movie/{movieId}` — Get show timings for a movie
- `POST /api/shows` — Schedule a new show

### 🎫 Bookings (`/api/bookings`)
- `POST /api/bookings` — Create a ticket booking (calls User, Show, Movie via OpenFeign & publishes Kafka event)
- `GET /api/bookings/{id}` — Get booking details
- `GET /api/bookings/user/{userId}` — Get user booking history
- `PUT /api/bookings/{id}/cancel` — Cancel booking and publish cancellation event

### 💳 Payments (`/api/payments`)
- `POST /api/payments` — Process payment (Credit Card, UPI, Net Banking)
- `GET /api/payments/booking/{bookingId}` — Get payment for booking
- `PUT /api/payments/{id}/refund` — Refund payment & publish refund event

### 📧 Notifications (`/api/notifications`)
- `GET /api/notifications/user/{userId}` — Get notifications for user
- `PUT /api/notifications/{id}/read` — Mark notification as read

### ⭐ Reviews (`/api/reviews`)
- `POST /api/reviews` — Submit rating and review
- `GET /api/reviews/movie/{movieId}` — Get reviews for a movie
- `GET /api/reviews/movie/{movieId}/rating` — Get average movie rating

### 📊 Analytics & Admin (`/api/analytics`)
- `GET /api/analytics/stats` — Overall system stats (events, users, bookings)
- `GET /api/analytics/movies/popular` — Most booked movies
- `GET /api/analytics/revenue?from=2026-01-01&to=2026-12-31` — Total revenue report

---

## 🍏 Apple Silicon (M2 / ARM64) Compatibility

Every component has been configured to run natively on Apple Silicon:
- **Base Images**: `eclipse-temurin:21-jre-alpine` and `node:20-alpine` provide native `linux/arm64` execution without Rosetta translation overhead.
- **Kafka & Zookeeper**: Uses Confluent ARM64-compatible images.
- **MySQL 8.0**: Runs ARM64 container natively.
- **Multi-stage Docker Builds**: Keeps container images tiny (~150MB each) for fast startup.

---

## 📦 Pushing to GitHub

```bash
git add .
git commit -m "Complete cloud-native microservices architecture with Jenkins CI/CD, React frontend, Eureka, Gateway, and Kafka"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```
