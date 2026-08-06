package com.karte.docs.module.question.dto;

import java.time.LocalDateTime;

public record QuestionResponse (
        Long id,
        String title,
        String content,
        String status,
        String authorName,
        String answerContent,
        String responderName,
        boolean isPublic,
        LocalDateTime createdAt
) {
}
