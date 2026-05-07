package com.synapseforce.common;

import com.synapseforce.project.Project;
import com.synapseforce.project.ProjectRepository;
import com.synapseforce.project.ProjectStatus;
import com.synapseforce.skill.Skill;
import com.synapseforce.skill.SkillRepository;
import com.synapseforce.user.Role;
import com.synapseforce.user.User;
import com.synapseforce.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final ProjectRepository projectRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        User admin = userRepository.save(User.builder()
                .fullName("Smriti Prajapati")
                .email("smriti@gmail.com")
                .password(passwordEncoder.encode("smriti123"))
                .role(Role.ADMIN)
                .build());

        User alice = createUser("Alice Chen", "alice@synapseforce.com");
        User bob = createUser("Bob Patel", "bob@synapseforce.com");
        User carol = createUser("Carol Kim", "carol@synapseforce.com");
        User dave = createUser("Dave Torres", "dave@synapseforce.com");
        User eve = createUser("Eve Nguyen", "eve@synapseforce.com");

        seedSkills(alice, new String[][]{{"Java", "9"}, {"Spring Boot", "8"}, {"SQL", "7"}, {"Docker", "6"}});
        seedSkills(bob, new String[][]{{"Python", "9"}, {"Machine Learning", "8"}, {"Pandas", "7"}, {"SQL", "6"}});
        seedSkills(carol, new String[][]{{"React", "9"}, {"TypeScript", "8"}, {"Nodejs", "7"}, {"GraphQL", "6"}});
        seedSkills(dave, new String[][]{{"Java", "7"}, {"Kubernetes", "8"}, {"AWS", "9"}, {"Docker", "8"}});
        seedSkills(eve, new String[][]{{"Python", "8"}, {"TensorFlow", "7"}, {"Deep Learning", "8"}, {"SQL", "5"}});

        // Seed sample projects
        projectRepository.save(Project.builder()
                .name("E-Commerce Platform")
                .description("Build a scalable e-commerce backend with microservices")
                .requiredSkills("Java, Spring Boot, Docker, SQL")
                .status(ProjectStatus.IN_PROGRESS)
                .progressPercent(65)
                .progressNote("API layer complete, working on payment integration")
                .teamMembers(new java.util.ArrayList<>(List.of(alice, dave)))
                .createdBy(admin)
                .build());

        projectRepository.save(Project.builder()
                .name("ML Recommendation Engine")
                .description("Build a product recommendation system using collaborative filtering")
                .requiredSkills("Python, Machine Learning, Pandas")
                .status(ProjectStatus.OPEN)
                .progressPercent(20)
                .progressNote("Data pipeline setup in progress")
                .teamMembers(new java.util.ArrayList<>(List.of(bob, eve)))
                .createdBy(admin)
                .build());

        projectRepository.save(Project.builder()
                .name("Customer Dashboard")
                .description("React-based analytics dashboard for customer insights")
                .requiredSkills("React, TypeScript, GraphQL")
                .status(ProjectStatus.OPEN)
                .progressPercent(0)
                .teamMembers(new java.util.ArrayList<>(List.of(carol)))
                .createdBy(admin)
                .build());

        log.info("✅ Demo data seeded. Login: smriti@gmail.com / smriti123");
    }

    private User createUser(String name, String email) {
        return userRepository.save(User.builder()
                .fullName(name)
                .email(email)
                .password(passwordEncoder.encode("pass123"))
                .role(Role.USER)
                .build());
    }

    private void seedSkills(User user, String[][] skills) {
        for (String[] s : skills) {
            skillRepository.save(Skill.builder()
                    .skillName(s[0])
                    .strengthLevel(Integer.parseInt(s[1]))
                    .user(user)
                    .build());
        }
    }
}
