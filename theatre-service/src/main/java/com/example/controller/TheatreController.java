package com.example.controller;


import com.example.entity.Theatre;
import com.example.service.TheatreService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/theatres")
public class TheatreController {

    private final TheatreService theatreService;

    public TheatreController(
            TheatreService theatreService) {

        this.theatreService = theatreService;
    }

    @PostMapping
    public ResponseEntity<Theatre> createTheatre(
            @RequestBody Theatre theatre) {

        return new ResponseEntity<>(
                theatreService.createTheatre(theatre),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public List<Theatre> getAllTheatres() {

        return theatreService.getAllTheatres();
    }

    @GetMapping("/{id}")
    public Theatre getTheatre(
            @PathVariable Long id) {

        return theatreService.getTheatreById(id);
    }

    @GetMapping("/city/{city}")
    public List<Theatre> getByCity(
            @PathVariable String city) {

        return theatreService.getTheatresByCity(city);
    }

    @PutMapping("/{id}")
    public Theatre updateTheatre(
            @PathVariable Long id,
            @RequestBody Theatre theatre) {

        return theatreService.updateTheatre(
                id,
                theatre
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTheatre(
            @PathVariable Long id) {

        theatreService.deleteTheatre(id);

        return ResponseEntity.ok(
                "Theatre deleted successfully"
        );
    }
}