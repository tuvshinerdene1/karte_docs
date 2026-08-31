package com.karte.docs.module.tutorial.dto;

import java.time.LocalDateTime;

public record TutorialVersionResponse(
        Long id,
        int versionNumber,
        String changelog,
        String authorName,
        LocalDateTime createdAt
) {}