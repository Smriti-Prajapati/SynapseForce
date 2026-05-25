package com.synapseforce.analytics;

import com.synapseforce.project.ProjectRepository;
import com.synapseforce.skill.SkillRepository;
import com.synapseforce.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/export")
@RequiredArgsConstructor
public class ExportController {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final ProjectRepository projectRepository;

    // Export all employees + their skills as CSV
    @GetMapping("/employees.csv")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportEmployees() {
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Full Name,Email,Role,Availability,Skill Count,Top Skills,Performance Score\n");

        userRepository.findAll().forEach(u -> {
            var skills = skillRepository.findByUserId(u.getId());
            double avg = skills.isEmpty() ? 0 :
                    skills.stream().mapToInt(s -> s.getStrengthLevel()).average().orElse(0);
            String topSkills = skills.stream().limit(5)
                    .map(s -> s.getSkillName()).reduce("", (a, b) -> a.isEmpty() ? b : a + " | " + b);
            csv.append(String.format("%d,\"%s\",\"%s\",%s,%s,%d,\"%s\",%d\n",
                    u.getId(), u.getFullName(), u.getEmail(),
                    u.getRole(),
                    u.getAvailability() != null ? u.getAvailability() : "AVAILABLE",
                    skills.size(), topSkills,
                    (int) Math.round(avg * 10)));
        });

        byte[] bytes = csv.toString().getBytes();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"employees-" + LocalDate.now() + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }

    // Export all projects as CSV
    @GetMapping("/projects.csv")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportProjects() {
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Name,Status,Progress,Deadline,Overdue,Required Skills,Team Members\n");

        projectRepository.findAll().forEach(p -> {
            boolean overdue = p.getDeadline() != null
                    && p.getDeadline().isBefore(LocalDate.now())
                    && p.getStatus() != com.synapseforce.project.ProjectStatus.COMPLETED;
            String team = p.getTeamMembers().stream()
                    .map(u -> u.getFullName())
                    .reduce("", (a, b) -> a.isEmpty() ? b : a + " | " + b);
            csv.append(String.format("%d,\"%s\",%s,%d%%,%s,%s,\"%s\",\"%s\"\n",
                    p.getId(), p.getName(), p.getStatus(),
                    p.getProgressPercent(),
                    p.getDeadline() != null ? p.getDeadline().toString() : "",
                    overdue ? "YES" : "NO",
                    p.getRequiredSkills(), team));
        });

        byte[] bytes = csv.toString().getBytes();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"projects-" + LocalDate.now() + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }
}
