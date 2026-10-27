package com.example.movie_service;

import com.example.movie_service.entity.Movie;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class MovieServiceApplicationTests {

    @Test
    void testMovieEntityCreation() {
        Movie movie = new Movie(1L, "Inception", "Sci-Fi", "English", 148, 8.8, "Dream within a dream", "http://poster.jpg");
        assertEquals(1L, movie.getId());
        assertEquals("Inception", movie.getTitle());
        assertEquals("Sci-Fi", movie.getGenre());
        assertEquals("English", movie.getLanguage());
        assertEquals(148, movie.getDuration());
        assertEquals(8.8, movie.getRating());
        assertEquals("http://poster.jpg", movie.getPosterUrl());
    }

    @Test
    void testMovieSettersAndGetters() {
        Movie movie = new Movie();
        movie.setTitle("Interstellar");
        movie.setGenre("Sci-Fi");
        movie.setRating(8.7);
        assertEquals("Interstellar", movie.getTitle());
        assertEquals("Sci-Fi", movie.getGenre());
        assertEquals(8.7, movie.getRating());
    }
}
