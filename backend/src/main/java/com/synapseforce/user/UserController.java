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

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> listAll() {
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.USER) // exclude admins from employee list
                .map(u -> {
                    var skills = skillRepository.findByUserId(u.getId());
                    double avg = skills.isEmpty() ? 0 :
                            skills.stream().mapToInt(s -> s.getStrengthLevel()).average().orElse(0);
                    return Map.<String, Object>of(
                        "id", u.getId(),
                        "fullName", u.getFullName(),
                        "email", u.getEmail(),
                        "role", u.getRole(),
                        "availability", u.getAvailability() != null ? u.getAvailability() : AvailabilityStatus.AVAILABLE,
                        "skillCount", skills.size(),
                        "topSkills", skills.stream().limit(4).map(s -> s.getSkillName()).toList(),
                        "performanceScore", (int) Math.round(avg * 10)
                    );
                })
                .toList();
        return ResponseEntity.ok(users);
    }

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
                .map(s -> Map.<String, Object>of("id", s.getId(),
                        "skillName", s.getSkillName(), "strengthLevel", s.getStrengthLevel(),
                        "endorsed", s.isEndorsed()))
                .toList();
        double avg = skills.isEmpty() ? 0 :
                skills.stream().mapToDouble(s -> (int) s.get("strengthLevel")).average().orElse(0);

        return ResponseEntity.ok(Map.of(
            "id", user.getId(),
            "fullName", user.getFullName(),
            "email", user.getEmail(),
            "role", user.getRole(),
            "availability", user.getAvailability() != null ? user.getAvailability() : AvailabilityStatus.AVAILABLE,
            "skills", skills,
            "performanceScore", (int) Math.round(avg * 10)
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMe(@AuthenticationPrincipal UserDetails principal) {
        User user = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        var skills = skillRepository.findByUserId(user.getId()).stream()
                .map(s -> Map.<String, Object>of("id", s.getId(),
                        "skillName", s.getSkillName(), "strengthLevel", s.getStrengthLevel(),
                        "endorsed", s.isEndorsed()))
                .toList();
        double avg = skills.isEmpty() ? 0 :
                skills.stream().mapToDouble(s -> (int) s.get("strengthLevel")).average().orElse(0);

        return ResponseEntity.ok(Map.of(
            "id", user.getId(),
            "fullName", user.getFullName(),
            "email", user.getEmail(),
            "role", user.getRole(),
            "availability", user.getAvailability() != null ? user.getAvailability() : AvailabilityStatus.AVAILABLE,
            "skills", skills,
            "performanceScore", (int) Math.round(avg * 10)
        ));
    }

    @GetMapping("/{id}/skills")
    public ResponseEntity<List<Map<String, Object>>> getUserSkills(@PathVariable Long id) {
        return ResponseEntity.ok(skillRepository.findByUserId(id).stream()
                .map(s -> Map.<String, Object>of("id", s.getId(),
                        "skillName", s.getSkillName(),
                        "strengthLevel", s.getStrengthLevel(),
                        "endorsed", s.isEndorsed()))
                .toList());
    }

    // HR endorses a skill
    @PatchMapping("/skills/{skillId}/endorse")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> endorseSkill(@PathVariable Long skillId) {
        var skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new IllegalArgumentException("Skill not found"));
        skill.setEndorsed(!skill.isEndorsed()); // toggle
        skillRepository.save(skill);
        return ResponseEntity.ok(Map.of(
            "id", skill.getId(),
            "skillName", skill.getSkillName(),
            "endorsed", skill.isEndorsed()
        ));
    }

    @PatchMapping("/{id}/availability")
    public ResponseEntity<Map<String, Object>> updateAvailability(
            @PathVariable Long id,
            @RequestParam AvailabilityStatus status,
            @AuthenticationPrincipal UserDetails principal) {

        User requester = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        if (!requester.getId().equals(id) && requester.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).build();
        }
        User user = userRepository.findById(id).orElseThrow();
        user.setAvailability(status);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("availability", status));
    }
}
