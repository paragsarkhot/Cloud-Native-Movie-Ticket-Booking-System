package com.example.movie_service.service;


import com.example.movie_service.entity.Movie;
import com.example.movie_service.repository.MovieRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class MovieService {

    private final MovieRepository movieRepository;

    public MovieService(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    public Movie addMovie(Movie movie) {
        return movieRepository.save(movie);
    }

    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    public Movie getMovieById(Long id) {

        return movieRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Movie not found with ID: " + id
                        )
                );
    }

    public Movie updateMovie(Long id, Movie newMovie) {

        Movie movie = getMovieById(id);

        movie.setTitle(newMovie.getTitle());
        movie.setGenre(newMovie.getGenre());
        movie.setLanguage(newMovie.getLanguage());
        movie.setDuration(newMovie.getDuration());
        movie.setRating(newMovie.getRating());
        movie.setDescription(newMovie.getDescription());
        movie.setPosterUrl(newMovie.getPosterUrl());

        return movieRepository.save(movie);
    }

    public void deleteMovie(Long id) {

        Movie movie = getMovieById(id);

        movieRepository.delete(movie);
    }

    public List<Movie> findByGenre(String genre) {
        return movieRepository.findByGenreIgnoreCase(genre);
    }

    public List<Movie> findByLanguage(String language) {
        return movieRepository.findByLanguageIgnoreCase(language);
    }
}
