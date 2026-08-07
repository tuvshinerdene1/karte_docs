package com.karte.docs.module.comment.dto;

import java.time.LocalDateTime;

public record CommentResponse (
    Long id,
    String content,
    String authorName,
    Long tutorialId,
    LocalDateTime createdAt
) {}
