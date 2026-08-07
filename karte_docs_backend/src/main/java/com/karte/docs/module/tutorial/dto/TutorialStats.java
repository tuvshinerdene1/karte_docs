package com.karte.docs.module.tutorial.dto;

public record TutorialStats(
        Long tutorialId,
        String title,
        long likeCount,
        long dislikeCount
) {}