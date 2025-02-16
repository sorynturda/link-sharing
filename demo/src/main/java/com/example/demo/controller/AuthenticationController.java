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
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthenticationController {
    private final AuthenticationService authenticationService;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(
            @RequestParam String username,
            @RequestParam String email,
            @RequestParam String password) {

        RegisterRequest request = RegisterRequest.builder()
                .username(username)
                .email(email)
                .password(password)
                .build();

        return ResponseEntity.ok(authenticationService.register(request));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestParam String username,
            @RequestParam String password) {

        AuthenticationRequest request = AuthenticationRequest.builder()
                .username(username)
                .password(password)
                .build();

        log.debug("Received authentication request for user: {}", request.getUsername());
        return ResponseEntity.ok(authenticationService.authenticate(request));
    }
}
