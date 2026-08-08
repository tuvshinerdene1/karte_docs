package com.karte.docs.module.auth.controller;

import com.karte.docs.module.auth.dto.AuthResponse;
import com.karte.docs.module.auth.dto.LoginRequest;
import com.karte.docs.module.auth.service.AuthService;
import com.karte.docs.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login (@RequestBody LoginRequest request){
        AuthResponse response = authService.login(request);
        return ApiResponse.success(response, "Login successful");
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestHeader("Authorization") String token){
        authService.logout(token);
        return ApiResponse.success(null, "Logged out successfully");
    }
}
