package com.dp.jobtracker.service;

import com.dp.jobtracker.model.dto.JobApplicationRequestDto;
import com.dp.jobtracker.model.dto.JobApplicationResponseDto;
import com.dp.jobtracker.model.dto.JobStatusUpdateDto;
import com.dp.jobtracker.model.enumeration.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface JobApplicationService {

    JobApplicationResponseDto create(Long userId, JobApplicationRequestDto dto);

    Page<JobApplicationResponseDto> search(Long userId,
                                           JobStatus status,
                                           String companyName,
                                           String title,
                                           LocalDate applicationDateFrom,
                                           LocalDate applicationDateTo,
                                           Pageable pageable);

    JobApplicationResponseDto getById(Long userId, Long id);

    JobApplicationResponseDto update(Long userId, Long id, JobApplicationRequestDto dto);

    JobApplicationResponseDto updateStatus(Long userId, Long id, JobStatusUpdateDto dto);

    void delete(Long userId, Long id);
}

