package com.synapseforce.project;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProjectRequest {
    @NotBlank
    private String name;

    private String description;

    @NotBlank
    private String requiredSkills; // comma-separated
}
