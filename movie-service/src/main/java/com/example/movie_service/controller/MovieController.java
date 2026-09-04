package com.example.movie_service.controller;


import com.example.movie_service.entity.Movie;
import com.example.movie_service.service.MovieService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    private final MovieService movieService;

    public MovieController(MovieService movieService) {
        this.movieService = movieService;
    }

    @PostMapping
    public ResponseEntity<Movie> addMovie(
            @RequestBody Movie movie) {

        return new ResponseEntity<>(
                movieService.addMovie(movie),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public List<Movie> getAllMovies() {
        return movieService.getAllMovies();
    }

    @GetMapping("/{id}")
    public Movie getMovieById(
            @PathVariable Long id) {

        return movieService.getMovieById(id);
    }

    @PutMapping("/{id}")
    public Movie updateMovie(
            @PathVariable Long id,
            @RequestBody Movie movie) {

        return movieService.updateMovie(id, movie);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMovie(
            @PathVariable Long id) {

        movieService.deleteMovie(id);

        return ResponseEntity.ok(
                "Movie deleted successfully"
        );
    }

    @GetMapping("/genre/{genre}")
    public List<Movie> getByGenre(
            @PathVariable String genre) {

        return movieService.findByGenre(genre);
    }

    @GetMapping("/language/{language}")
    public List<Movie> getByLanguage(
            @PathVariable String language) {

        return movieService.findByLanguage(language);
    }
}