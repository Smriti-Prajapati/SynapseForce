package com.synapseforce.project;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class ProgressUpdateRequest {
    @Min(0) @Max(100)
    private int progressPercent;

    private String progressNote;
}
