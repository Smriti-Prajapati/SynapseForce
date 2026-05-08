package com.synapseforce.project;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ProjectRequest {
    @NotBlank
    private String name;

    private String description;

    @NotBlank
    private String requiredSkills;

    private LocalDate deadline;
}
