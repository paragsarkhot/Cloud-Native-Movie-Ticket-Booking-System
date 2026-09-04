package com.example.service;


import com.example.entity.Theatre;
import com.example.repository.TheatreRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TheatreService {

    private final TheatreRepository theatreRepository;

    public TheatreService(
            TheatreRepository theatreRepository) {

        this.theatreRepository = theatreRepository;
    }

    public Theatre createTheatre(Theatre theatre) {

        return theatreRepository.save(theatre);
    }

    public List<Theatre> getAllTheatres() {

        return theatreRepository.findAll();
    }

    public Theatre getTheatreById(Long id) {

        return theatreRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Theatre not found"
                        )
                );
    }

    public List<Theatre> getTheatresByCity(
            String city) {

        return theatreRepository.findByCityIgnoreCase(city);
    }

    public Theatre updateTheatre(
            Long id,
            Theatre newTheatre) {

        Theatre theatre = getTheatreById(id);

        theatre.setName(newTheatre.getName());
        theatre.setCity(newTheatre.getCity());
        theatre.setAddress(newTheatre.getAddress());

        return theatreRepository.save(theatre);
    }

    public void deleteTheatre(Long id) {

        Theatre theatre = getTheatreById(id);

        theatreRepository.delete(theatre);
    }
}
