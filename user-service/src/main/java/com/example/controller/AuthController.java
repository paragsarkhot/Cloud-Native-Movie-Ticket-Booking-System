package com.example.controller;

import com.example.dto.AuthRequest;
import com.example.dto.AuthResponse;
import com.example.dto.RegisterRequest;
import com.example.entity.User;
import com.example.security.JwtUtil;
import com.example.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserService userService, JwtUtil jwtUtil, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole() != null && !request.getRole().isBlank() ? request.getRole() : "CUSTOMER");

        User saved = userService.saveRawUser(user);
        String token = jwtUtil.generateToken(saved.getId(), saved.getEmail(), saved.getRole(), saved.getName());

        return new ResponseEntity<>(
                new AuthResponse(token, saved.getId(), saved.getName(), saved.getEmail(), saved.getRole()),
                HttpStatus.CREATED
        );
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        User user = userService.getUserByEmail(request.getEmail());

        boolean matches = passwordEncoder.matches(request.getPassword(), user.getPassword()) ||
                request.getPassword().equals(user.getPassword()); // backwards compatibility with existing plain text passwords

        if (!matches) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole(), user.getName());
        return ResponseEntity.ok(
                new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole())
        );
    }

    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateToken(@RequestParam String token) {
        boolean valid = jwtUtil.validateToken(token);
        if (!valid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("valid", false));
        }

        return ResponseEntity.ok(Map.of(
                "valid", true,
                "email", jwtUtil.extractEmail(token),
                "userId", jwtUtil.extractUserId(token),
                "role", jwtUtil.extractRole(token)
        ));
    }
}
