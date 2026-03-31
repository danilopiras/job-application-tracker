package com.dp.jobtracker.model.dto;

import com.dp.jobtracker.model.enumeration.JobStatus;

import java.time.LocalDate;
import java.util.List;

import lombok.Data;

@Data
public class JobApplicationResponseDto {

    private Long id;
    private String title;
    private String companyName;
    private String source;
    private JobStatus status;
    private LocalDate applicationDate;
    private LocalDate lastUpdateDate;
    private String location;
    private String salaryExpectation;
    private String notes;
    private List<InterviewDto> interviews;
}

