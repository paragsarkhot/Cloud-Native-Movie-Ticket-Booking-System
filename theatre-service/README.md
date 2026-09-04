# Theatre Service

The Theatre Service manages theatres and movie shows.

## Technologies

- Java 21
- Spring Boot
- Spring Data JPA
- MySQL
- Swagger

## Port

8083

## Database

theatre_db

## Theatre Endpoints

POST /api/theatres
GET /api/theatres
GET /api/theatres/{id}
PUT /api/theatres/{id}
DELETE /api/theatres/{id}

## Show Endpoints

POST /api/shows
GET /api/shows
GET /api/shows/{id}
GET /api/shows/movie/{movieId}

## Swagger

http://localhost:8083/swagger-ui.html