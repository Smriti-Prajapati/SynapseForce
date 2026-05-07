package com.synapseforce.task;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TaskRequest {
    @NotBlank
    private String title;

    private String description;
    private Long assignedToUserId;
    private LocalDate dueDate;
}
