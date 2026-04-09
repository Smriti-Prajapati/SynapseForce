package com.synapseforce.team;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/team")
@RequiredArgsConstructor
public class TeamController {

    private final TeamSuggestionService suggestionService;

    @GetMapping("/suggest")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> suggest(@RequestParam String skills) {
        TeamSuggestionResult result = suggestionService.suggest(skills);

        return ResponseEntity.ok(Map.of(
            "requiredSkills", result.requiredSkills(),
            "bestTeam", result.bestTeam().stream().map(this::toDto).toList(),
            "optionalMembers", result.optionalMembers().stream().map(this::toDto).toList()
        ));
    }

    private Map<String, Object> toDto(ScoredUser su) {
        return Map.of(
            "userId", su.userId(),
            "fullName", su.fullName(),
            "email", su.email(),
            "score", Math.round(su.score() * 100.0) / 100.0,
            "matchedSkills", su.matchedSkills()
        );
    }
}
