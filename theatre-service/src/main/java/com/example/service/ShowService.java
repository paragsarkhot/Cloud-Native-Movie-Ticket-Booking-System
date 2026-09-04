package com.example.service;


import com.example.entity.Show;
import com.example.repository.ShowRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ShowService {

    private final ShowRepository showRepository;
    private final TheatreService theatreService;

    public ShowService(
            ShowRepository showRepository,
            TheatreService theatreService) {

        this.showRepository = showRepository;
        this.theatreService = theatreService;
    }

    public Show createShow(Show show) {

        theatreService.getTheatreById(
                show.getTheatreId()
        );

        return showRepository.save(show);
    }

    public List<Show> getAllShows() {

        return showRepository.findAll();
    }

    public Show getShowById(Long id) {

        return showRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Show not found"
                        )
                );
    }

    public List<Show> getShowsByMovie(
            Long movieId) {

        return showRepository.findByMovieId(movieId);
    }

    public List<Show> getShowsByTheatre(
            Long theatreId) {

        return showRepository.findByTheatreId(theatreId);
    }

    public void deleteShow(Long id) {

        Show show = getShowById(id);

        showRepository.delete(show);
    }
}
