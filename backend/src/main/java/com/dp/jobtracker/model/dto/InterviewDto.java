package com.dp.jobtracker.model.dto;

import com.dp.jobtracker.model.enumeration.InterviewType;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class InterviewDto {

    private Long id;
    private Long jobApplicationId;
    private LocalDateTime dateTime;
    private InterviewType type;
    private String interviewer;
    private String notes;
}

