package com.karte.docs.module.tutorial.controller;

import com.karte.docs.shared.dto.ApiResponse;
import com.karte.docs.shared.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;


@RestController
@RequestMapping("/tutorials/images")
@RequiredArgsConstructor
public class ImageUploadController {
    private final CloudinaryService cloudinaryService;

    @PostMapping("/upload")
    public ApiResponse<String> upload (@RequestParam("file") MultipartFile file) throws IOException{
        System.out.println("Received upload request for: " + file.getOriginalFilename());
        String url = cloudinaryService.uploadImage(file);
        return ApiResponse.success(url, "Image uploaded to Cloudinary successfully");
    }
}
