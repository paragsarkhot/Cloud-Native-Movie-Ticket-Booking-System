package com.example.client;


import com.example.dto.MovieDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "movie-service",
        url = "${services.movie.url}"
)
public interface MovieClient {

    @GetMapping("/api/movies/{id}")
    MovieDTO getMovieById(
            @PathVariable("id") Long id
    );
}