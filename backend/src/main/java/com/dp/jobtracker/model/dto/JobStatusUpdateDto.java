package com.dp.jobtracker.model.dto;

import com.dp.jobtracker.model.enumeration.JobStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class JobStatusUpdateDto {

    @NotNull
    private JobStatus status;
}