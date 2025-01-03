package com.example.demo.model.dto;

import lombok.Data;

@Data
public class FileDTO {
    private Long fileId;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String filePath;
    private Long userId;
    private String shareToken;
    private boolean shareEnabled;
    private String shareUrl;
}