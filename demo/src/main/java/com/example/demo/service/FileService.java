package com.example.demo.service;

import com.example.demo.exception.FileNotFoundException;
import com.example.demo.exception.FileStorageException;
import com.example.demo.exception.UserNotFoundException;
import com.example.demo.model.dto.FileDTO;
import com.example.demo.model.entity.File;  // Add this import for your custom File entity
import com.example.demo.model.entity.User;
import com.example.demo.repository.FileRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.transaction.Transactional;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class FileService {

    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final Path fileStorageLocation;


    private static final long MAX_FILE_SIZE = 20 * 1024 * 1024;

    @Value("${app.base-url}")
    private String baseUrl;

    @Autowired
    public FileService(FileRepository fileRepository,
                       UserRepository userRepository,
                       @Value("${file.upload-dir}") String uploadDir) {
        this.fileRepository = fileRepository;
        this.userRepository = userRepository;
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            throw new FileStorageException("Could not create upload directory", ex);
        }
    }

    public FileDTO uploadFile(MultipartFile file, Long userId) {
        validateFileSize(file);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String fileName = normalizeFileName(file.getOriginalFilename());
        String uniqueFileName = generateUniqueFileName(fileName);

        try {
            Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            File fileEntity = createFileEntity(file, user, uniqueFileName, targetLocation);
            File savedFile = fileRepository.save(fileEntity);
            return convertToDTO(savedFile);
        } catch (IOException ex) {
            throw new FileStorageException("Could not store file " + fileName, ex);
        }
    }

    public Resource downloadFile(Long fileId, Long userId) {
        File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new FileNotFoundException("File not found with id: " + fileId));

        validateUserAccess(file, userId);

        try {
            Path filePath = this.fileStorageLocation.resolve(Paths.get(file.getFilePath()).getFileName());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new FileNotFoundException("File not found: " + file.getFileName());
            }
        } catch (MalformedURLException ex) {
            throw new FileNotFoundException("File not found: " + file.getFileName(), ex);
        }
    }

    public void deleteFile(Long fileId, Long userId) {
        File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new FileNotFoundException("File not found with id: " + fileId));

        validateUserAccess(file, userId);

        try {
            Path filePath = this.fileStorageLocation.resolve(Paths.get(file.getFilePath()).getFileName());
            boolean deleted = Files.deleteIfExists(filePath);

            if (!deleted) {
                throw new FileStorageException("File not found in storage: " + file.getFileName());
            }

            fileRepository.delete(file);
        } catch (IOException ex) {
            throw new FileStorageException("Could not delete file: " + file.getFileName(), ex);
        }
    }

    public List<FileDTO> getUserFiles(Long userId) {
        return fileRepository.findAllByUserId(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }


    private void validateFileSize(MultipartFile file) {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new FileStorageException("File size exceeds maximum limit of " + MAX_FILE_SIZE / (1024 * 1024) + "MB");
        }
    }

private void validateUserAccess(File file, Long userId) {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    boolean isAdmin = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_admin"));

    if (!isAdmin && !file.getUser().getId().equals(userId)) {
        throw new AccessDeniedException("You don't have permission to access this file");
    }
}

    private String normalizeFileName(String fileName) {
        fileName = StringUtils.cleanPath(fileName);
        if (fileName.contains("..")) {
            throw new FileStorageException("Invalid file path sequence in filename");
        }
        return fileName;
    }

    private String generateUniqueFileName(String originalFileName) {
        return System.currentTimeMillis() + "_" + originalFileName;
    }

    private File createFileEntity(MultipartFile file, User user, String fileName, Path filePath) {
        File fileEntity = new File();
        fileEntity.setUser(user);
        fileEntity.setFileName(fileName);
        fileEntity.setFileType(file.getContentType());
        fileEntity.setFileSize(file.getSize());
        fileEntity.setFilePath(filePath.toString());
        return fileEntity;
    }


    public FileDTO toggleFileSharing(Long fileId, Long userId) {
        File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new FileNotFoundException("File not found with id: " + fileId));

        validateUserAccess(file, userId);

        if (!file.isShareEnabled()) {
            // Generează un nou token de partajare doar dacă activăm partajarea
            file.setShareToken(generateShareToken());
            file.setShareEnabled(true);
        } else {
            // Dezactivează partajarea și șterge token-ul
            file.setShareToken(null);
            file.setShareEnabled(false);
        }

        file = fileRepository.save(file);
        return convertToDTO(file);
    }

    public String generateShareLink(Long fileId, Long userId) {
        File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new FileNotFoundException("File not found with id: " + fileId));

        if (!file.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to share this file");
        }

        if (file.getShareToken() == null) {
            file.setShareToken(UUID.randomUUID().toString());
            file = fileRepository.save(file);
        }

        return baseUrl + "/files/shared/" + file.getShareToken();
    }

    public Resource downloadSharedFile(String shareToken) {
        File file = fileRepository.findByShareToken(shareToken)
                .orElseThrow(() -> new FileNotFoundException("Shared file not found"));

        try {
            Path filePath = this.fileStorageLocation.resolve(
                    Paths.get(file.getFilePath()).getFileName()
            );
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new FileNotFoundException("File not found: " + file.getFileName());
            }
        } catch (MalformedURLException ex) {
            throw new FileNotFoundException("File not found: " + file.getFileName(), ex);
        }
    }

    private String generateShareToken() {
        return UUID.randomUUID().toString();
    }

    private FileDTO convertToDTO(File file) {
        FileDTO dto = new FileDTO();
        dto.setFileId(file.getFileId());
        dto.setFileName(file.getFileName());
        dto.setFileType(file.getFileType());
        dto.setFileSize(file.getFileSize());
        dto.setFilePath(file.getFilePath());
        dto.setUserId(file.getUser().getId());
        dto.setShareToken(file.getShareToken());
        dto.setShareEnabled(file.isShareEnabled());

        if (file.isShareEnabled() && file.getShareToken() != null) {
            dto.setShareUrl(baseUrl + "/files/shared/" + file.getShareToken());
        }

        return dto;
    }

}