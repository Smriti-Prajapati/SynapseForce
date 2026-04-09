package com.synapseforce.resume;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ResumeResponse {
    private Long id;
    private String fileName;
    private String contentType;
    private LocalDateTime uploadedAt;
    private Long userId;
    private String userFullName;

    public static ResumeResponse from(Resume resume) {
        return ResumeResponse.builder()
                .id(resume.getId())
                .fileName(resume.getFileName())
                .contentType(resume.getContentType())
                .uploadedAt(resume.getUploadedAt())
                .userId(resume.getUser() != null ? resume.getUser().getId() : null)
                .userFullName(resume.getUser() != null ? resume.getUser().getFullName() : null)
                .build();
    }
}
