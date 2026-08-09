package com.karte.docs.shared.utils;

import com.karte.docs.module.auth.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {
    // gets the currently authenticated user entity from the SecurityContext
    public User getCurrentUser(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()){
            return null;
        }

        return (User) authentication.getPrincipal();
    }
}
