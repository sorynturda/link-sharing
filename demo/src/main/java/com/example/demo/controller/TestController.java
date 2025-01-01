package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping({"/api/test/public", "/test/public"})
    public ResponseEntity<String> publicEndpoint() {
        return ResponseEntity.ok("Public endpoint is working!");
    }

    @GetMapping({"/api/test/secured", "/test/secured"})
    public ResponseEntity<String> securedEndpoint() {
        return ResponseEntity.ok("Secured endpoint is working!");
    }
}