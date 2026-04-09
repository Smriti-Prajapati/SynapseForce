package com.synapseforce.analytics;

import com.synapseforce.project.ProjectRepository;
import com.synapseforce.project.ProjectStatus;
import com.synapseforce.skill.SkillRepository;
import com.synapseforce.user.UserRepository;
import com.synapseforce.resume.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final ResumeRepository resumeRepository;
    private final ProjectRepository projectRepository;

    @GetMapping("/overview")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> overview() {
        long totalEmployees = userRepository.count();
        long totalSkills = skillRepository.count();
        long totalResumes = resumeRepository.count();
        long totalProjects = projectRepository.count();
        long activeProjects = projectRepository.findAll().stream()
                .filter(p -> p.getStatus() == ProjectStatus.IN_PROGRESS).count();

        List<Object[]> rawDistribution = skillRepository.findSkillDistribution();
        List<Map<String, Object>> skillDistribution = rawDistribution.stream()
                .limit(10)
                .map(row -> Map.<String, Object>of("skill", row[0], "count", row[1]))
                .toList();

        String topSkill = skillDistribution.isEmpty() ? "N/A"
                : (String) skillDistribution.get(0).get("skill");

        return ResponseEntity.ok(Map.of(
            "totalEmployees", totalEmployees,
            "totalSkills", totalSkills,
            "totalResumes", totalResumes,
            "totalProjects", totalProjects,
            "activeProjects", activeProjects,
            "skillDistribution", skillDistribution,
            "insight", topSkill.equals("N/A")
                ? "No skills detected yet"
                : topSkill + " is the most common skill across your team"
        ));
    }
}
