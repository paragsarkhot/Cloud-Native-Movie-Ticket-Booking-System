package com.example.controller;


import com.example.entity.Show;
import com.example.service.ShowService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shows")
public class ShowController {

    private final ShowService showService;

    public ShowController(ShowService showService) {

        this.showService = showService;
    }

    @PostMapping
    public ResponseEntity<Show> createShow(
            @RequestBody Show show) {

        return new ResponseEntity<>(
                showService.createShow(show),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public List<Show> getAllShows() {

        return showService.getAllShows();
    }

    @GetMapping("/{id}")
    public Show getShowById(
            @PathVariable Long id) {

        return showService.getShowById(id);
    }

    @GetMapping("/movie/{movieId}")
    public List<Show> getShowsByMovie(
            @PathVariable Long movieId) {

        return showService.getShowsByMovie(movieId);
    }

    @GetMapping("/theatre/{theatreId}")
    public List<Show> getShowsByTheatre(
            @PathVariable Long theatreId) {

        return showService.getShowsByTheatre(
                theatreId
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteShow(
            @PathVariable Long id) {

        showService.deleteShow(id);

        return ResponseEntity.ok(
                "Show deleted successfully"
        );
    }
}