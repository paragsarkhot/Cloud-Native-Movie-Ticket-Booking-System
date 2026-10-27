package com.example;

import com.example.dto.AuthRequest;
import com.example.dto.RegisterRequest;
import com.example.entity.User;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UserServiceApplicationTests {

    @Test
    void testUserEntityCreation() {
        User user = new User(1L, "Parag Sarkhot", "parag@gmail.com", "password123", "CUSTOMER");
        assertEquals(1L, user.getId());
        assertEquals("Parag Sarkhot", user.getName());
        assertEquals("parag@gmail.com", user.getEmail());
        assertEquals("CUSTOMER", user.getRole());
    }

    @Test
    void testAuthRequestDto() {
        AuthRequest req = new AuthRequest("parag@gmail.com", "secret");
        assertEquals("parag@gmail.com", req.getEmail());
        assertEquals("secret", req.getPassword());
    }

    @Test
    void testRegisterRequestDto() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Parag");
        req.setEmail("parag@gmail.com");
        req.setPassword("pass");
        req.setRole("CUSTOMER");
        assertEquals("Parag", req.getName());
        assertEquals("parag@gmail.com", req.getEmail());
        assertEquals("pass", req.getPassword());
        assertEquals("CUSTOMER", req.getRole());
    }
}
