package com.dp.jobtracker.controller;

import com.dp.jobtracker.model.dto.JobApplicationRequestDto;
import com.dp.jobtracker.model.dto.JobApplicationResponseDto;
import com.dp.jobtracker.model.dto.JobStatusUpdateDto;
import com.dp.jobtracker.model.enumeration.JobStatus;
import com.dp.jobtracker.security.UserPrincipal;
import com.dp.jobtracker.service.JobApplicationService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.NO_CONTENT;

@RestController
@RequestMapping("/api/applications")
@Validated
public class JobApplicationController {

    @Autowired
    private JobApplicationService service;

    @PostMapping
    @ResponseStatus(CREATED)
    public JobApplicationResponseDto create(@AuthenticationPrincipal UserPrincipal principal,
                                            @RequestBody @Validated JobApplicationRequestDto dto) {
        return service.create(principal.getId(), dto);
    }

    @GetMapping
    public Page<JobApplicationResponseDto> search(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(name = "status", required = false) JobStatus status,
            @RequestParam(name = "companyName", required = false) String companyName,
            @RequestParam(name = "title", required = false) String title,
            @RequestParam(name = "applicationDateFrom", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate applicationDateFrom,
            @RequestParam(name = "applicationDateTo", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate applicationDateTo,
            Pageable pageable) {
        return service.search(principal.getId(), status, companyName, title, applicationDateFrom, applicationDateTo, pageable);
    }

    @GetMapping("/{id}")
    public JobApplicationResponseDto getById(@AuthenticationPrincipal UserPrincipal principal,
                                             @PathVariable(name = "id") Long id) {
        return service.getById(principal.getId(), id);
    }

    @PutMapping("/{id}")
    public JobApplicationResponseDto update(@AuthenticationPrincipal UserPrincipal principal,
                                            @PathVariable(name = "id") Long id,
                                            @RequestBody @Validated JobApplicationRequestDto dto) {
        return service.update(principal.getId(), id, dto);
    }

    @PatchMapping("/{id}/status")
    public JobApplicationResponseDto updateStatus(@AuthenticationPrincipal UserPrincipal principal,
                                                  @PathVariable(name = "id") Long id,
                                                  @RequestBody @Validated JobStatusUpdateDto dto) {
        return service.updateStatus(principal.getId(), id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(NO_CONTENT)
    public void delete(@AuthenticationPrincipal UserPrincipal principal,
                       @PathVariable(name = "id") Long id) {
        service.delete(principal.getId(), id);
    }
}

