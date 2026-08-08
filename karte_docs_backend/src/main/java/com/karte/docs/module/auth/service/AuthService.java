package com.karte.docs.module.auth.service;

import com.karte.docs.module.auth.dto.AuthResponse;
import com.karte.docs.module.auth.dto.LoginRequest;
import com.karte.docs.module.auth.entity.BlacklistedToken;
import com.karte.docs.module.auth.entity.User;
import com.karte.docs.module.auth.repository.BlacklistedTokenRepository;
import com.karte.docs.module.auth.repository.UserRepository;
import com.karte.docs.shared.security.JwtUtils;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final BlacklistedTokenRepository blacklistedTokenRepository;

    public AuthResponse login(LoginRequest request){
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        User user = userRepository.findByEmail(request.email()).orElseThrow();
        String token = jwtUtils.generateToken(user.getEmail());

        return new AuthResponse(token, user.getEmail(), user.getRole().name(), user.getFullName());
    }

    public void logout(String token){
        // remove "Bearer " prefix
        String jwt = token.substring(7);

        // get expiry date from token so we know when we can safely delete it from DB later
        Date expiry = jwtUtils.extractClaim(jwt, Claims::getExpiration);

        LocalDateTime expiryTime = expiry.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();
        BlacklistedToken blacklistedToken = new BlacklistedToken(jwt, expiryTime);
        blacklistedTokenRepository.save(blacklistedToken);
    }
}
