package com.synapseforce.project;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProjectResponse> create(
            @Valid @RequestBody ProjectRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(projectService.create(request, principal.getUsername()));
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getAll() {
        return ResponseEntity.ok(projectService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getById(id));
    }

    @GetMapping("/my/{userId}")
    public ResponseEntity<List<ProjectResponse>> getMyProjects(@PathVariable Long userId) {
        return ResponseEntity.ok(projectService.getProjectsForUser(userId));
    }

    // HR: change project status
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProjectResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam ProjectStatus status) {
        return ResponseEntity.ok(projectService.updateStatus(id, status));
    }

    // Employee: update progress on their project
    @PatchMapping("/{id}/progress")
    public ResponseEntity<ProjectResponse> updateProgress(
            @PathVariable Long id,
            @Valid @RequestBody ProgressUpdateRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(projectService.updateProgress(id, request, principal.getUsername()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        projectService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
