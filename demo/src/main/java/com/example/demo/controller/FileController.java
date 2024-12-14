package com.example.demo.controller;

import com.example.demo.model.dto.FileDTO;
import com.example.demo.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping("/upload")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FileDTO> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId) throws IOException {
        return ResponseEntity.ok(fileService.uploadFile(file, userId));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("#userId == authentication.principal.id")
    public ResponseEntity<List<FileDTO>> getUserFiles(@PathVariable Long userId) {
        return ResponseEntity.ok(fileService.getUserFiles(userId));
    }

    @GetMapping("/download/{fileId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable Long fileId,
            @RequestParam Long userId) {
        Resource resource = fileService.downloadFile(fileId, userId);
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" + resource.getFilename() + "\"")
            .body(resource);
    }

    @DeleteMapping("/{fileId}")
    @PreAuthorize("#userId == authentication.principal.id")
    public ResponseEntity<Void> deleteFile(
            @PathVariable Long fileId,
            @RequestParam Long userId) {
        fileService.deleteFile(fileId, userId);
        return ResponseEntity.noContent().build();
    }
}