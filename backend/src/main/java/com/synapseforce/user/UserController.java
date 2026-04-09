package com.synapseforce.user;

import com.synapseforce.skill.Skill;
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

    // HR: list all employees
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> listAll() {
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(u -> {
                    List<Skill> skills = skillRepository.findByUserId(u.getId());
                    return Map.<String, Object>of(
                        "id", u.getId(),
                        "fullName", u.getFullName(),
                        "email", u.getEmail(),
                        "role", u.getRole(),
                        "skillCount", skills.size(),
                        "topSkills", skills.stream().limit(4).map(Skill::getSkillName).toList()
                    );
                })
                .toList();
        return ResponseEntity.ok(users);
    }

    // Get any user's profile (admin) or own profile (user)
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getProfile(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Users can only view their own profile; admins can view anyone
        User requester = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        if (requester.getRole() != com.synapseforce.user.Role.ADMIN
                && !requester.getId().equals(id)) {
            return ResponseEntity.status(403).build();
        }

        List<Skill> skills = skillRepository.findByUserId(id);
        return ResponseEntity.ok(Map.of(
            "id", user.getId(),
            "fullName", user.getFullName(),
            "email", user.getEmail(),
            "role", user.getRole(),
            "skills", skills
        ));
    }

    // Logged-in user's own profile shortcut
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMe(@AuthenticationPrincipal UserDetails principal) {
        User user = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        List<Skill> skills = skillRepository.findByUserId(user.getId());
        return ResponseEntity.ok(Map.of(
            "id", user.getId(),
            "fullName", user.getFullName(),
            "email", user.getEmail(),
            "role", user.getRole(),
            "skills", skills
        ));
    }

    @GetMapping("/{id}/skills")
    public ResponseEntity<List<Skill>> getUserSkills(@PathVariable Long id) {
        return ResponseEntity.ok(skillRepository.findByUserId(id));
    }
}
