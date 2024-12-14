package com.example.demo.service;

import com.example.demo.model.dto.FileDTO;
import com.example.demo.model.entity.File;
import com.example.demo.model.entity.User;
import com.example.demo.repository.FileRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import jakarta.transaction.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class FileService {
    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private UserRepository userRepository;

    private final Path rootLocation = Paths.get("uploads");

    public FileDTO uploadFile(MultipartFile file, Long userId) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String fileName = file.getOriginalFilename();
        Path targetLocation = rootLocation.resolve(fileName);
        Files.copy(file.getInputStream(), targetLocation);

        File fileEntity = new File();
        fileEntity.setUser(user);
        fileEntity.setFileName(fileName);
        fileEntity.setFileType(file.getContentType());
        fileEntity.setFileSize(file.getSize());
        fileEntity.setFilePath(targetLocation.toString());

        File savedFile = fileRepository.save(fileEntity);
        return convertToDTO(savedFile);
    }

    public List<FileDTO> getUserFiles(Long id) {
        return fileRepository.findAllByUserId(id)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private FileDTO convertToDTO(File file) {
        FileDTO dto = new FileDTO();
        dto.setFileId(file.getFileId());
        dto.setFileName(file.getFileName());
        dto.setFileType(file.getFileType());
        dto.setFileSize(file.getFileSize());
        dto.setFilePath(file.getFilePath());
        dto.setUserId(file.getUser().getId());
        return dto;
    }
}
