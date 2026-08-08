package com.karte.docs.module.auth.dto;

public record LoginRequest (
        String email,
        String password
) {}

