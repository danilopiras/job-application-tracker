package com.dp.jobtracker.model.dto;

import com.dp.jobtracker.model.enumeration.JobStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

import lombok.Data;

@Data
public class JobApplicationRequestDto {

    @NotBlank
    @Size(max = 200)
    private String title;

    @NotBlank
    @Size(max = 200)
    private String companyName;

    @Size(max = 100)
    private String source;

    @NotNull
    private JobStatus status;

    private LocalDate applicationDate;

    @Size(max = 200)
    private String location;

    @Size(max = 100)
    private String salaryExpectation;

    @Size(max = 2000)
    private String notes;
}

