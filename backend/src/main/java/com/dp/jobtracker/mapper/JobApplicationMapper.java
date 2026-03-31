package com.dp.jobtracker.mapper;

import com.dp.jobtracker.model.dto.InterviewDto;
import com.dp.jobtracker.model.dto.JobApplicationRequestDto;
import com.dp.jobtracker.model.dto.JobApplicationResponseDto;
import com.dp.jobtracker.model.entity.Interview;
import com.dp.jobtracker.model.entity.JobApplication;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface JobApplicationMapper {

    @Mapping(target = "user", ignore = true)
    JobApplication toEntity(JobApplicationRequestDto dto);

    @Mapping(target = "jobApplicationId", source = "jobApplication.id")
    InterviewDto toInterviewDto(Interview interview);

    List<InterviewDto> toInterviewDtos(List<Interview> interviews);

    @Mapping(target = "interviews", source = "interviews")
    JobApplicationResponseDto toResponseDto(JobApplication entity);

    void updateEntityFromDto(JobApplicationRequestDto dto, @MappingTarget JobApplication entity);

    void updateInterviewEntityFromDto(InterviewDto dto, @MappingTarget Interview entity);
}

