package com.example.demo.service;

import com.example.demo.exception.DuplicateResourceException;
import com.example.demo.exception.UserNotFoundException;
import com.example.demo.model.dto.AuthenticationRequest;
import com.example.demo.model.dto.AuthenticationResponse;
import com.example.demo.model.dto.RegisterRequest;
import com.example.demo.model.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;

@Service
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthenticationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        String token = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(token)
                .username(user.getUsername())
                .role(user.getRole().toString())
                .build();
    }

       @Transactional
    public AuthenticationResponse register(RegisterRequest request) {
        try {
            log.debug("Starting registration for user: {}", request.getUsername());

            if (userRepository.existsByUsername(request.getUsername())) {
                log.debug("Username already exists: {}", request.getUsername());
                throw new DuplicateResourceException("Username already exists");
            }

            if (userRepository.existsByEmail(request.getEmail())) {
                log.debug("Email already exists: {}", request.getEmail());
                throw new DuplicateResourceException("Email already exists");
            }

            User user = new User();
            user.setUsername(request.getUsername());
            user.setEmail(request.getEmail());
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            user.setRole("user");

            log.debug("Saving user to database");
            user = userRepository.save(user);
            log.debug("User saved successfully with ID: {}", user.getId());

            String token = jwtService.generateToken(user);
            log.debug("JWT token generated successfully");

            return AuthenticationResponse.builder()
                    .token(token)
                    .username(user.getUsername())
                    .role(user.getRole().toString())
                    .build();

        } catch (Exception e) {
            log.error("Registration failed with exception", e);
            throw new RuntimeException("Failed to register user: " + e.getMessage(), e);
        }
    }
}