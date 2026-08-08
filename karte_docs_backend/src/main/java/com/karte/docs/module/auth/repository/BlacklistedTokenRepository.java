package com.karte.docs.module.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.karte.docs.module.auth.entity.BlacklistedToken;

public interface BlacklistedTokenRepository extends JpaRepository<BlacklistedToken, Long> {
    boolean existsByToken(String token);
}
