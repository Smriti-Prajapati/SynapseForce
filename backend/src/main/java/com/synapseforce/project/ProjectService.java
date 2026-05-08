package com.synapseforce.project;

import com.synapseforce.activity.ActivityLog;
import com.synapseforce.activity.ActivityLogRepository;
import com.synapseforce.notification.NotificationRepository;
import com.synapseforce.team.TeamSuggestionService;
import com.synapseforce.team.ScoredUser;
import com.synapseforce.user.User;
import com.synapseforce.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TeamSuggestionService suggestionService;
    private final NotificationRepository notificationRepository;
    private final ActivityLogRepository activityLogRepository;
    private final ApplicationContext applicationContext;

    public ProjectResponse create(ProjectRequest request, String creatorEmail) {
        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Long> suggestedIds = suggestionService
                .suggest(request.getRequiredSkills())
                .bestTeam()
                .stream()
                .map(ScoredUser::userId)
                .toList();

        List<User> teamMembers = new java.util.ArrayList<>(
                userRepository.findAllById(suggestedIds)
        );

        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .requiredSkills(request.getRequiredSkills())
                .status(ProjectStatus.OPEN)
                .deadline(request.getDeadline())
                .teamMembers(teamMembers)
                .createdBy(creator)
                .build();

        Project saved = projectRepository.save(project);

        // Notify each assigned team member
        teamMembers.forEach(member ->
            notificationRepository.save(
                com.synapseforce.notification.Notification.builder()
                    .userId(member.getId())
                    .message("You have been assigned to project: " + request.getName())
                    .build()
            )
        );

        return ProjectResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getAll() {
        return projectRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(ProjectResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getById(Long id) {
        return projectRepository.findById(id)
                .map(ProjectResponse::from)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getProjectsForUser(Long userId) {
        return projectRepository.findByTeamMemberId(userId)
                .stream().map(ProjectResponse::from).toList();
    }

    // HR only: update status
    public ProjectResponse updateStatus(Long id, ProjectStatus status) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        project.setStatus(status);
        // Auto-set 100% when marked complete
        if (status == ProjectStatus.COMPLETED && project.getProgressPercent() < 100) {
            project.setProgressPercent(100);
        }
        return ProjectResponse.from(projectRepository.save(project));
    }

    // Employee: update their project progress / Admin: update any project progress
    public ProjectResponse updateProgress(Long projectId, ProgressUpdateRequest req, String userEmail) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        boolean isAdmin = user.getRole() == com.synapseforce.user.Role.ADMIN;

        if (!isAdmin) {
            boolean isMember = project.getTeamMembers().stream()
                    .anyMatch(m -> m.getId().equals(user.getId()));
            if (!isMember) throw new IllegalArgumentException("You are not assigned to this project");
        }

        project.setProgressPercent(req.getProgressPercent());
        if (req.getProgressNote() != null) project.setProgressNote(req.getProgressNote());
        project.setProgressUpdatedAt(LocalDateTime.now());

        if (req.getProgressPercent() == 100) {
            project.setStatus(ProjectStatus.COMPLETED);
        } else if (req.getProgressPercent() > 0 && project.getStatus() == ProjectStatus.OPEN) {
            project.setStatus(ProjectStatus.IN_PROGRESS);
        }

        // Log activity
        activityLogRepository.save(ActivityLog.builder()
                .actorName(user.getFullName())
                .action(user.getFullName() + " updated \"" + project.getName()
                        + "\" progress to " + req.getProgressPercent() + "%")
                .category("PROJECT")
                .build());

        return ProjectResponse.from(projectRepository.save(project));
    }

    public void delete(Long id) {
        projectRepository.deleteById(id);
    }

    public ProjectResponse addMember(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        boolean alreadyMember = project.getTeamMembers().stream()
                .anyMatch(m -> m.getId().equals(userId));
        if (!alreadyMember) {
            project.getTeamMembers().add(user);

            // Notify the employee
            com.synapseforce.notification.Notification notification =
                com.synapseforce.notification.Notification.builder()
                    .userId(userId)
                    .message("You have been added to project: " + project.getName())
                    .build();
            notificationRepository.save(notification);
        }
        return ProjectResponse.from(projectRepository.save(project));
    }

    public ProjectResponse removeMember(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        project.getTeamMembers().removeIf(m -> m.getId().equals(userId));
        return ProjectResponse.from(projectRepository.save(project));
    }

    public java.util.Map<String, Object> analyzeSkillGap(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        java.util.List<String> required = java.util.Arrays.stream(
                project.getRequiredSkills().split(","))
                .map(String::trim).map(String::toLowerCase).toList();

        java.util.Set<String> covered = new java.util.HashSet<>();
        for (com.synapseforce.user.User member : project.getTeamMembers()) {
            com.synapseforce.skill.SkillRepository skillRepo =
                applicationContext.getBean(com.synapseforce.skill.SkillRepository.class);
            skillRepo.findByUserId(member.getId()).forEach(s ->
                covered.add(s.getSkillName().toLowerCase()));
        }

        java.util.List<String> missing = required.stream()
                .filter(r -> covered.stream().noneMatch(c -> c.contains(r) || r.contains(c)))
                .toList();

        java.util.List<String> coveredList = required.stream()
                .filter(r -> covered.stream().anyMatch(c -> c.contains(r) || r.contains(c)))
                .toList();

        return java.util.Map.of(
            "projectName", project.getName(),
            "requiredSkills", required,
            "coveredSkills", coveredList,
            "missingSkills", missing,
            "coveragePercent", required.isEmpty() ? 100
                : Math.round((coveredList.size() * 100.0) / required.size())
        );
    }
}
