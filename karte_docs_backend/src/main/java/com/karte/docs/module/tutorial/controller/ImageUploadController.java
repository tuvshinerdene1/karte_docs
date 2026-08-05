package com.karte.docs.module.tutorial.controller;

import com.karte.docs.shared.dto.ApiResponse;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@RestController
@RequestMapping("/tutorials/images")
public class ImageUploadController {
    private final String UPLOAD_DIR = "uploads/tutorials/";

    @PostMapping("/upload")
    public ApiResponse<String> uploadImage(@RequestParam("file") MultipartFile file) throws IOException{
        // Ensure directory exists
        Files.createDirectories(Paths.get(UPLOAD_DIR));

        // Generate unique name
        String fileName = UUID.randomUUID().toString() + '_' + file.getOriginalFilename();
        Path path = Paths.get(UPLOAD_DIR + fileName);

        // save file
        Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

        // return the URL (In production, this would be a full URL)
        return ApiResponse.success("/api/v1/tutorials/images/" + fileName, "Image uploaded successfully");
    }
}
