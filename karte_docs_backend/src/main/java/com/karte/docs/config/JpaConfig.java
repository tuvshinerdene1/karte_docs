package com.karte.docs.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaAuditing // this makes @createdDate work
public class JpaConfig {
}
