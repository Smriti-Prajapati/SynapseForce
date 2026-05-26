package com.synapseforce.common;

import com.synapseforce.user.AvailabilityStatus;
import com.synapseforce.user.Role;
import com.synapseforce.user.User;
import com.synapseforce.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Only seed in local/dev — skip if any users already exist (production has real data)
        if (userRepository.count() > 0) return;

        // In production with a fresh Supabase DB, seed only the admin account.
        // All other data (employees, projects, skills) should be created through the app.
        userRepository.save(User.builder()
                .fullName("Smriti Prajapati")
                .email("smriti@gmail.com")
                .password(passwordEncoder.encode("smriti123"))
                .role(Role.ADMIN)
                .availability(AvailabilityStatus.AVAILABLE)
                .build());

        log.info("✅ Admin account created. Login: smriti@gmail.com / smriti123");
    }
}
