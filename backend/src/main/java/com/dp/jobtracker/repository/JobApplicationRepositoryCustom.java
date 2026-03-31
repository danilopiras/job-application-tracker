package com.dp.jobtracker.repository;

import com.dp.jobtracker.model.entity.JobApplication;
import com.dp.jobtracker.model.enumeration.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface JobApplicationRepositoryCustom {

    Page<JobApplication> search(Long userId,
                                JobStatus status,
                                String companyName,
                                String title,
                                LocalDate applicationDateFrom,
                                LocalDate applicationDateTo,
                                Pageable pageable);
}

