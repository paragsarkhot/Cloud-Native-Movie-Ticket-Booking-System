package com.example.client;


import com.example.dto.ShowDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "theatre-service",
        url = "${services.theatre.url}"
)
public interface TheatreClient {

    @GetMapping("/api/shows/{id}")
    ShowDTO getShowById(
            @PathVariable("id") Long id
    );
}