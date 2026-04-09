package com.synapseforce.project;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ProjectResponse {
    private Long id;
    private String name;
    private String description;
    private String requiredSkills;
    private ProjectStatus status;
    private int progressPercent;
    private String progressNote;
    private LocalDateTime progressUpdatedAt;
    private LocalDateTime createdAt;
    private String createdBy;
    private List<TeamMemberDto> teamMembers;

    @Data
    @Builder
    public static class TeamMemberDto {
        private Long id;
        private String fullName;
        private String email;
    }

    public static ProjectResponse from(Project p) {
        return ProjectResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .requiredSkills(p.getRequiredSkills())
                .status(p.getStatus())
                .progressPercent(p.getProgressPercent())
                .progressNote(p.getProgressNote())
                .progressUpdatedAt(p.getProgressUpdatedAt())
                .createdAt(p.getCreatedAt())
                .createdBy(p.getCreatedBy() != null ? p.getCreatedBy().getFullName() : null)
                .teamMembers(p.getTeamMembers() == null ? List.of() :
                    p.getTeamMembers().stream()
                        .map(u -> TeamMemberDto.builder()
                            .id(u.getId())
                            .fullName(u.getFullName())
                            .email(u.getEmail())
                            .build())
                        .toList())
                .build();
    }
}
