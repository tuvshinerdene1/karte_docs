package com.karte.docs.config;

import com.karte.docs.module.auth.entity.Role;
import com.karte.docs.module.auth.entity.User;
import com.karte.docs.module.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args){
        if (userRepository.count() == 0){
            // create support user
            User support = new User();
            support.setEmail("support@karte.mn");
            support.setPassword(passwordEncoder.encode("support123"));
            support.setRole(Role.ROLE_SUPPORT);
            support.setFullName("Karte Support team");
            userRepository.save(support);

            // create medical user
            User medical = new User();
            medical.setEmail("doctor@hospital.mn");
            medical.setPassword(passwordEncoder.encode("doctor123"));
            medical.setRole(Role.ROLE_MEDICAL);
            medical.setFullName("DR. Bat Erdene");
            userRepository.save(medical);
        }
    }
}
