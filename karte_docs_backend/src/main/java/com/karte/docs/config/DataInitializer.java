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
            // 1. Create Support User if not exists
            createUserIfNotFound("support@karte.mn", "support123", Role.ROLE_SUPPORT, "Karte Support Team");

            // 2. Create Medical User 1 if not exists
            createUserIfNotFound("doctor@hospital.mn", "doctor123", Role.ROLE_MEDICAL, "DR. Bat Erdene");

            // 3. Create Medical User 2 if not exists
            createUserIfNotFound("doctor2@hospital.mn", "doctor123", Role.ROLE_MEDICAL, "DR. Dorjoo");

            createUserIfNotFound("mendbayar45@gmail.com", "doctor123", Role.ROLE_MEDICAL, "DR. Mendee");
            createUserIfNotFound("myagmardashdavaadulam@gmail.com", "doctor123", Role.ROLE_MEDICAL, "DR. Not Dulmaa");

    }

    public void createUserIfNotFound(String email, String password, Role role, String fullName){
        if (userRepository.findByEmail(email).isEmpty()){
            User user = new User();
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(role);
            user.setFullName(fullName);
            userRepository.save(user);
            System.out.println("Seeded user:" + email);
        }
    }
}
