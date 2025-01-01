package com.example.demo.controller;

import com.example.demo.model.dto.AuthenticationRequest;
import com.example.demo.model.dto.AuthenticationResponse;
import com.example.demo.model.dto.RegisterRequest;
import com.example.demo.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthenticationController {
    private final AuthenticationService authenticationService;


    @CrossOrigin(origins = "*")
    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request) {
        log.debug("Received registration request for user: {}", request.getUsername());
        try {
            AuthenticationResponse response = authenticationService.register(request);
            log.debug("Successfully registered user: {}", request.getUsername());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Registration failed for user: " + request.getUsername(), e);
            throw e;
        }
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
        log.debug("Received authentication request for user: {}", request.getUsername());
        return ResponseEntity.ok(authenticationService.authenticate(request));
    }
}