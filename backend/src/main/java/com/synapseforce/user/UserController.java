package com.synapseforce.user;

import com.synapseforce.skill.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;

    // HR: list all employees with skill summary
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> listAll() {
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(u -> {
                    var skills = skillRepository.findByUserId(u.getId());
                    return Map.<String, Object>of(
                        "id", u.getId(),
                        "fullName", u.getFullName(),
                        "email", u.getEmail(),
                        "role", u.getRole(),
                        "skillCount", skills.size(),
                        "topSkills", skills.stream().limit(4)
                            .map(s -> s.getSkillName()).toList()
                    );
                })
                .toList();
        return ResponseEntity.ok(users);
    }

    // Get any user's profile — admin sees anyone, user sees only themselves
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getProfile(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        User requester = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        if (requester.getRole() != Role.ADMIN && !requester.getId().equals(id)) {
            return ResponseEntity.status(403).build();
        }

        var skills = skillRepository.findByUserId(id).stream()
                .map(s -> Map.<String, Object>of(
                    "id", s.getId(),
                    "skillName", s.getSkillName(),
                    "strengthLevel", s.getStrengthLevel()
                ))
                .toList();

        return ResponseEntity.ok(Map.of(
            "id", user.getId(),
            "fullName", user.getFullName(),
            "email", user.getEmail(),
            "role", user.getRole(),
            "skills", skills
        ));
    }

    // Logged-in user's own profile
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMe(@AuthenticationPrincipal UserDetails principal) {
        User user = userRepository.findByEmail(principal.getUsername()).orElseThrow();

        var skills = skillRepository.findByUserId(user.getId()).stream()
                .map(s -> Map.<String, Object>of(
                    "id", s.getId(),
                    "skillName", s.getSkillName(),
                    "strengthLevel", s.getStrengthLevel()
                ))
                .toList();

        return ResponseEntity.ok(Map.of(
            "id", user.getId(),
            "fullName", user.getFullName(),
            "email", user.getEmail(),
            "role", user.getRole(),
            "skills", skills
        ));
    }

    // Skills for a specific user
    @GetMapping("/{id}/skills")
    public ResponseEntity<List<Map<String, Object>>> getUserSkills(@PathVariable Long id) {
        var result = skillRepository.findByUserId(id).stream()
                .map(s -> Map.<String, Object>of(
                    "id", s.getId(),
                    "skillName", s.getSkillName(),
                    "strengthLevel", s.getStrengthLevel()
                ))
                .toList();
        return ResponseEntity.ok(result);
    }
}
