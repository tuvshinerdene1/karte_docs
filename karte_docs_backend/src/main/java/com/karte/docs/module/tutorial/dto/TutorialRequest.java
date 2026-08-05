package com.karte.docs.module.tutorial.dto;

import jakarta.validation.constraints.NotBlank;
public record TutorialRequest (
    @NotBlank String title,
    @NotBlank String content,
    @NotBlank String targetAudience,
    String changelog
){}
