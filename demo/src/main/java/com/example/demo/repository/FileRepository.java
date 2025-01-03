package com.example.demo.repository;

import com.example.demo.model.entity.File;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FileRepository extends JpaRepository<File, Long> {
    List<File> findAllByUserId(Long userId);

    Optional<File> findByShareTokenAndShareEnabled(String shareToken, boolean shareEnabled);
    Optional<File> findByShareToken(String shareToken);


}