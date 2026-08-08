package com.karte.docs.module.auth.dto;

public record AuthResponse(
        String token,
        String email,
        String role,
        String fullName
) {
}
