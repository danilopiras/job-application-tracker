package com.dp.jobtracker.service.impl;

import com.dp.jobtracker.exception.ResourceNotFoundException;
import com.dp.jobtracker.mapper.JobApplicationMapper;
import com.dp.jobtracker.model.dto.JobApplicationRequestDto;
import com.dp.jobtracker.model.dto.JobApplicationResponseDto;
import com.dp.jobtracker.model.dto.JobStatusUpdateDto;
import com.dp.jobtracker.model.entity.JobApplication;
import com.dp.jobtracker.model.entity.User;
import com.dp.jobtracker.model.enumeration.JobStatus;
import com.dp.jobtracker.repository.JobApplicationRepository;
import com.dp.jobtracker.repository.UserRepository;
import com.dp.jobtracker.service.JobApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@Transactional
public class JobApplicationServiceImpl implements JobApplicationService {

    @Autowired
    private JobApplicationRepository repository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobApplicationMapper mapper;

    @Override
    public JobApplicationResponseDto create(Long userId, JobApplicationRequestDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        JobApplication entity = mapper.toEntity(dto);
        entity.setUser(user);
        if (entity.getApplicationDate() == null) {
            entity.setApplicationDate(LocalDate.now());
        }
        entity.setLastUpdateDate(entity.getApplicationDate());
        JobApplication saved = repository.save(entity);
        return mapper.toResponseDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobApplicationResponseDto> search(Long userId,
                                                  JobStatus status,
                                                  String companyName,
                                                  String title,
                                                  LocalDate applicationDateFrom,
                                                  LocalDate applicationDateTo,
                                                  Pageable pageable) {
        return repository.search(userId, status, companyName, title, applicationDateFrom, applicationDateTo, pageable)
                .map(mapper::toResponseDto);
    }

    @Override
    @Transactional(readOnly = true)
    public JobApplicationResponseDto getById(Long userId, Long id) {
        JobApplication entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found"));
        if (entity.getUser() == null || !entity.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Job application not found");
        }
        return mapper.toResponseDto(entity);
    }

    @Override
    public JobApplicationResponseDto update(Long userId, Long id, JobApplicationRequestDto dto) {
        JobApplication entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found"));
        if (entity.getUser() == null || !entity.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Job application not found");
        }
        mapper.updateEntityFromDto(dto, entity);
        entity.setLastUpdateDate(LocalDate.now());
        JobApplication saved = repository.save(entity);
        return mapper.toResponseDto(saved);
    }

    @Override
    public JobApplicationResponseDto updateStatus(Long userId, Long id, JobStatusUpdateDto dto) {
        JobApplication entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found"));
        if (entity.getUser() == null || !entity.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Job application not found");
        }
        entity.setStatus(dto.getStatus());
        entity.setLastUpdateDate(LocalDate.now());
        JobApplication saved = repository.save(entity);
        return mapper.toResponseDto(saved);
    }

    @Override
    public void delete(Long userId, Long id) {
        JobApplication entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found"));
        if (entity.getUser() == null || !entity.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Job application not found");
        }
        repository.delete(entity);
    }
}

