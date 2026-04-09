package com.synapseforce.project;

import com.synapseforce.team.TeamSuggestionService;
import com.synapseforce.team.ScoredUser;
import com.synapseforce.user.User;
import com.synapseforce.user.UserRepository;
import lombok.RequiredArgsConstructor;
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
                .teamMembers(teamMembers)
                .createdBy(creator)
                .build();

        return ProjectResponse.from(projectRepository.save(project));
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

    // Employee: update their project progress
    public ProjectResponse updateProgress(Long projectId, ProgressUpdateRequest req, String employeeEmail) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        User employee = userRepository.findByEmail(employeeEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Verify the employee is actually on this project
        boolean isMember = project.getTeamMembers().stream()
                .anyMatch(m -> m.getId().equals(employee.getId()));
        if (!isMember) {
            throw new IllegalArgumentException("You are not assigned to this project");
        }

        project.setProgressPercent(req.getProgressPercent());
        project.setProgressNote(req.getProgressNote());
        project.setProgressUpdatedAt(LocalDateTime.now());

        // Auto-transition status based on progress
        if (req.getProgressPercent() == 100) {
            project.setStatus(ProjectStatus.COMPLETED);
        } else if (req.getProgressPercent() > 0 && project.getStatus() == ProjectStatus.OPEN) {
            project.setStatus(ProjectStatus.IN_PROGRESS);
        }

        return ProjectResponse.from(projectRepository.save(project));
    }

    public void delete(Long id) {
        projectRepository.deleteById(id);
    }
}
