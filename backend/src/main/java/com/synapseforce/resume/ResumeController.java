package com.synapseforce.resume;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.synapseforce.user.User;
import com.synapseforce.user.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/resume")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;
    private final UserRepository userRepository;

    // Any authenticated employee uploads their own resume
    @PostMapping("/upload")
    public ResponseEntity<ResumeResponse> upload(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails principal) throws Exception {

        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Resume resume = resumeService.uploadAndProcess(file, user.getId());
        return ResponseEntity.ok(ResumeResponse.from(resume));
    }

    // Employee views their own resumes
    @GetMapping("/my")
    public ResponseEntity<List<ResumeResponse>> myResumes(
            @AuthenticationPrincipal UserDetails principal) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(
            resumeService.getResumesForUser(user.getId())
                .stream().map(ResumeResponse::from).toList()
        );
    }

    // HR views all resumes
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ResumeResponse>> listAll() {
        return ResponseEntity.ok(
            resumeService.getAllResumes()
                .stream().map(ResumeResponse::from).toList()
        );
    }

    // Serve the actual file — HR can open/preview it
    @GetMapping("/{id}/file")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<org.springframework.core.io.Resource> serveFile(
            @PathVariable Long id) throws java.io.IOException {

        Resume resume = resumeService.getById(id);
        java.nio.file.Path filePath = java.nio.file.Paths.get(resume.getFilePath());

        if (!java.nio.file.Files.exists(filePath)) {
            return ResponseEntity.notFound().build();
        }

        org.springframework.core.io.Resource resource =
            new org.springframework.core.io.UrlResource(filePath.toUri());

        String contentType = resume.getContentType() != null
            ? resume.getContentType() : "application/octet-stream";

        return ResponseEntity.ok()
            .header("Content-Type", contentType)
            .header("Content-Disposition", "inline; filename=\"" + resume.getFileName() + "\"")
            .body(resource);
    }
}
