package com.dp.jobtracker.service;

import com.dp.jobtracker.exception.ResourceNotFoundException;
import com.dp.jobtracker.mapper.JobApplicationMapper;
import com.dp.jobtracker.model.dto.JobApplicationRequestDto;
import com.dp.jobtracker.model.dto.JobApplicationResponseDto;
import com.dp.jobtracker.model.entity.JobApplication;
import com.dp.jobtracker.model.entity.User;
import com.dp.jobtracker.model.enumeration.JobStatus;
import com.dp.jobtracker.repository.JobApplicationRepository;
import com.dp.jobtracker.repository.UserRepository;
import com.dp.jobtracker.service.impl.JobApplicationServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JobApplicationServiceImplTest {

    private static final Long USER_ID = 1L;

    @Mock
    private JobApplicationRepository repository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JobApplicationMapper mapper;

    @InjectMocks
    private JobApplicationServiceImpl service;

    @Test
    void create_shouldPersistAndReturnDto() {
        JobApplicationRequestDto request = new JobApplicationRequestDto();
        request.setTitle("Java Dev");
        request.setCompanyName("Acme");
        request.setStatus(JobStatus.APPLIED);

        User user = new User();
        user.setId(USER_ID);
        JobApplication entity = new JobApplication();
        JobApplication saved = new JobApplication();
        saved.setId(1L);
        saved.setUser(user);

        JobApplicationResponseDto responseDto = new JobApplicationResponseDto();
        responseDto.setId(1L);

        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        when(mapper.toEntity(request)).thenReturn(entity);
        when(repository.save(entity)).thenReturn(saved);
        when(mapper.toResponseDto(saved)).thenReturn(responseDto);

        JobApplicationResponseDto result = service.create(USER_ID, request);

        verify(userRepository).findById(USER_ID);
        verify(repository).save(entity);
        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    void getById_shouldThrowWhenNotFound() {
        when(repository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.getById(USER_ID, 1L));
    }

    @Test
    void getById_shouldThrowWhenNotOwnedByUser() {
        User otherUser = new User();
        otherUser.setId(999L);
        JobApplication entity = new JobApplication();
        entity.setId(1L);
        entity.setUser(otherUser);
        when(repository.findById(1L)).thenReturn(Optional.of(entity));

        assertThrows(ResourceNotFoundException.class, () -> service.getById(USER_ID, 1L));
    }

    @Test
    void search_shouldReturnMappedPage() {
        User user = new User();
        user.setId(USER_ID);
        JobApplication entity = new JobApplication();
        entity.setUser(user);
        JobApplicationResponseDto dto = new JobApplicationResponseDto();
        dto.setId(1L);

        Page<JobApplication> page = new PageImpl<>(List.of(entity), PageRequest.of(0, 10), 1);

        when(repository.search(USER_ID, null, null, null, null, null, PageRequest.of(0, 10))).thenReturn(page);
        when(mapper.toResponseDto(entity)).thenReturn(dto);

        Page<JobApplicationResponseDto> result = service.search(USER_ID, null, null, null, null, null, PageRequest.of(0, 10));

        assertEquals(1, result.getTotalElements());
        assertEquals(1L, result.getContent().get(0).getId());
    }
}

