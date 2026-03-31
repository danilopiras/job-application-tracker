package com.dp.jobtracker.repository;

import com.dp.jobtracker.model.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long>, JobApplicationRepositoryCustom {

    List<JobApplication> findByUserId(Long userId);

    List<JobApplication> findByUserIsNull();
}

