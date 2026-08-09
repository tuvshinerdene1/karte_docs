package com.karte.docs.module.tutorial.dto;

import java.time.LocalDateTime;

public record TutorialResponse (
        Long id,
        String title,
        String content,
        String targetAudience,
        int currentVersionNumber,
        String lastChangelog,
        String authorName,
        LocalDateTime updatedAt
){}
