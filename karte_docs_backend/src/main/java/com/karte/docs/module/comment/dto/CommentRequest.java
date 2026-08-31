package com.karte.docs.module.comment.dto;

import jakarta.validation.constraints.NotBlank;

public record CommentRequest (
        @NotBlank(message = "Comment content cannot be empty") String content,
        Long tutorialId,
        Long parentId
){}
