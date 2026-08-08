package com.karte.docs.module.auth.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor
public class BlacklistedToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 500, unique = true)
    private String token;

    private LocalDateTime expiryDate;

    public BlacklistedToken(String token, LocalDateTime expiryDate){
        this.token = token;
        this.expiryDate = expiryDate;
    }
}
