package com.dp.jobtracker.service;

import com.dp.jobtracker.model.dto.InterviewDto;

public interface InterviewService {

    InterviewDto addInterview(Long userId, Long applicationId, InterviewDto dto);

    InterviewDto updateInterview(Long userId, Long id, InterviewDto dto);

    void deleteInterview(Long userId, Long id);
}

