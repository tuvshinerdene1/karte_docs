package com.karte.docs.module.comment.dto;

import java.time.LocalDateTime;
import java.util.List;

public record CommentResponse(
        Long id,
        String content,
        String authorName,
        Long tutorialId,
        LocalDateTime createdAt,
        Long parentId,
        List<CommentResponse> replies // Add this
) {}