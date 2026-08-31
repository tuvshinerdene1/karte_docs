package com.karte.docs.shared.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;


@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IOException("File is empty or null");
        }

        try {
            // resource_type: auto is critical for blobs/data sent from browser
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "karte_tutorials",
                            "resource_type", "auto"
                    ));

            // Use secure_url (https) instead of url (http)
            Object url = uploadResult.get("secure_url");
            if (url == null) {
                url = uploadResult.get("url");
            }

            return url.toString();
        } catch (Exception e) {
            e.printStackTrace(); // This WILL show the red text in IntelliJ now
            throw new IOException("Cloudinary API Error: " + e.getMessage());
        }
    }
}
