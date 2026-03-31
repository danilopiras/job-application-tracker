package com.dp.jobtracker.repository;

import com.dp.jobtracker.model.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InterviewRepository extends JpaRepository<Interview, Long> {
}

