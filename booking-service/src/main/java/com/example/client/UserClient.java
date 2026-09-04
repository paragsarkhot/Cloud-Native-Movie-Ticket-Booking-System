package com.example.client;

import com.example.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "user-service",
        url = "${services.user.url}"
)
public interface UserClient {

    @GetMapping("/api/users/{id}")
    UserDTO getUserById(
            @PathVariable("id") Long id
    );
}
