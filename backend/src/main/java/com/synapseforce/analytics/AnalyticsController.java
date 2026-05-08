package com.synapseforce.analytics;

import com.synapseforce.activity.ActivityLogRepository;
import com.synapseforce.project.ProjectRepository;
import com.synapseforce.project.ProjectStatus;
import com.synapseforce.skill.SkillRepository;
import com.synapseforce.user.UserRepository;
import com.synapseforce.resume.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final ResumeRepository resumeRepository;
    private final ProjectRepository projectRepository;
    private final ActivityLogRepository activityLogRepository;

    @GetMapping("/overview")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> overview() {
        long totalEmployees = userRepository.count();
        long totalSkills = skillRepository.count();
        long totalResumes = resumeRepository.count();
        long totalProjects = projectRepository.count();
        long activeProjects = projectRepository.findAll().stream()
                .filter(p -> p.getStatus() == ProjectStatus.IN_PROGRESS).count();
        long overdueProjects = projectRepository.findAll().stream()
                .filter(p -> p.getDeadline() != null
                        && p.getDeadline().isBefore(LocalDate.now())
                        && p.getStatus() != ProjectStatus.COMPLETED).count();

        List<Object[]> rawDistribution = skillRepository.findSkillDistribution();
        List<Map<String, Object>> skillDistribution = rawDistribution.stream()
                .limit(10)
                .map(row -> Map.<String, Object>of("skill", row[0], "count", row[1]))
                .toList();

        String topSkill = skillDistribution.isEmpty() ? "N/A"
                : (String) skillDistribution.get(0).get("skill");

        // Skill gap: skills needed by open projects vs skills available in team
        List<String> neededSkills = projectRepository.findAll().stream()
                .filter(p -> p.getStatus() != ProjectStatus.COMPLETED)
                .flatMap(p -> Arrays.stream(p.getRequiredSkills().split(",")))
                .map(String::trim).map(String::toLowerCase).distinct().toList();

        List<String> availableSkills = skillRepository.findAll().stream()
                .map(s -> s.getSkillName().toLowerCase()).distinct().toList();

        List<String> missingSkills = neededSkills.stream()
                .filter(n -> availableSkills.stream().noneMatch(a -> a.contains(n) || n.contains(a)))
                .toList();

        // Recent activity
        List<Map<String, Object>> recentActivity = activityLogRepository
                .findTop20ByOrderByOccurredAtDesc().stream()
                .map(a -> Map.<String, Object>of(
                    "id", a.getId(),
                    "actorName", a.getActorName(),
                    "action", a.getAction(),
                    "category", a.getCategory(),
                    "occurredAt", a.getOccurredAt().toString()
                )).toList();

        return ResponseEntity.ok(Map.of(
            "totalEmployees", totalEmployees,
            "totalSkills", totalSkills,
            "totalResumes", totalResumes,
            "totalProjects", totalProjects,
            "activeProjects", activeProjects,
            "overdueProjects", overdueProjects,
            "skillDistribution", skillDistribution,
            "missingSkills", missingSkills,
            "recentActivity", recentActivity,
            "insight", topSkill.equals("N/A") ? "No skills detected yet"
                    : topSkill + " is the most common skill across your team"
        ));
    }
}
