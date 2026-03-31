package com.dp.jobtracker.service.impl;

import com.dp.jobtracker.exception.ResourceNotFoundException;
import com.dp.jobtracker.mapper.JobApplicationMapper;
import com.dp.jobtracker.model.dto.InterviewDto;
import com.dp.jobtracker.model.entity.Interview;
import com.dp.jobtracker.model.entity.JobApplication;
import com.dp.jobtracker.repository.InterviewRepository;
import com.dp.jobtracker.repository.JobApplicationRepository;
import com.dp.jobtracker.service.InterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class InterviewServiceImpl implements InterviewService {

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Autowired
    private JobApplicationMapper mapper;

    @Override
    public InterviewDto addInterview(Long userId, Long applicationId, InterviewDto dto) {
        JobApplication jobApplication = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found"));
        if (jobApplication.getUser() == null || !jobApplication.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Job application not found");
        }

        Interview interview = new Interview();
        interview.setJobApplication(jobApplication);
        mapper.updateInterviewEntityFromDto(dto, interview);

        Interview saved = interviewRepository.save(interview);
        return mapper.toInterviewDto(saved);
    }

    @Override
    public InterviewDto updateInterview(Long userId, Long id, InterviewDto dto) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found"));
        if (interview.getJobApplication().getUser() == null
                || !interview.getJobApplication().getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Interview not found");
        }
        mapper.updateInterviewEntityFromDto(dto, interview);
        Interview saved = interviewRepository.save(interview);
        return mapper.toInterviewDto(saved);
    }

    @Override
    public void deleteInterview(Long userId, Long id) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found"));
        if (interview.getJobApplication().getUser() == null
                || !interview.getJobApplication().getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Interview not found");
        }
        interviewRepository.delete(interview);
    }
}

