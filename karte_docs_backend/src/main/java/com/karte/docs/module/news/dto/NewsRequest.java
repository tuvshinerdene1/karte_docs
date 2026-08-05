package com.karte.docs.module.news.dto;

import jakarta.validation.constraints.NotBlank;

public record NewsRequest (
        @NotBlank(message = "Title is required") String title,
        @NotBlank(message = "Content is required") String content
){}
