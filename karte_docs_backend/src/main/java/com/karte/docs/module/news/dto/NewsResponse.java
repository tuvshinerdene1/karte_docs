package com.karte.docs.module.news.dto;

import java.time.LocalDateTime;

public record NewsResponse(
        Long id,
        String title,
        String content,
        String authorName,
        LocalDateTime createdAt
) {}
