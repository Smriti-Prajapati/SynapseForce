package com.synapseforce.task;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    // HR creates a task inside a project
    @PostMapping("/project/{projectId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TaskResponse> create(
            @PathVariable Long projectId,
            @Valid @RequestBody TaskRequest request) {
        return ResponseEntity.ok(taskService.create(projectId, request));
    }

    // HR views all tasks for a project
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TaskResponse>> getByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(taskService.getByProject(projectId));
    }

    // Employee views their own tasks
    @GetMapping("/my/{userId}")
    public ResponseEntity<List<TaskResponse>> getMyTasks(@PathVariable Long userId) {
        return ResponseEntity.ok(taskService.getMyTasks(userId));
    }

    // Employee updates task status
    @PatchMapping("/{taskId}/status")
    public ResponseEntity<TaskResponse> updateStatus(
            @PathVariable Long taskId,
            @RequestParam TaskStatus status,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(taskService.updateStatus(taskId, status, principal.getUsername()));
    }

    @DeleteMapping("/{taskId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long taskId) {
        taskService.delete(taskId);
        return ResponseEntity.noContent().build();
    }
}
