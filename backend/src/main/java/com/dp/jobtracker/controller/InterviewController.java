package com.dp.jobtracker.controller;

import com.dp.jobtracker.model.dto.InterviewDto;
import com.dp.jobtracker.security.UserPrincipal;
import com.dp.jobtracker.service.InterviewService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.NO_CONTENT;

import org.springframework.beans.factory.annotation.Autowired;

@RestController
@Validated
public class InterviewController {

    @Autowired
    private InterviewService interviewService;

    @PostMapping("/api/applications/{applicationId}/interviews")
    @ResponseStatus(CREATED)
    public InterviewDto add(@AuthenticationPrincipal UserPrincipal principal,
                            @PathVariable(name = "applicationId") Long applicationId,
                            @RequestBody @Validated InterviewDto dto) {
        return interviewService.addInterview(principal.getId(), applicationId, dto);
    }

    @PutMapping("/api/interviews/{id}")
    public InterviewDto update(@AuthenticationPrincipal UserPrincipal principal,
                               @PathVariable(name = "id") Long id,
                               @RequestBody @Validated InterviewDto dto) {
        return interviewService.updateInterview(principal.getId(), id, dto);
    }

    @DeleteMapping("/api/interviews/{id}")
    @ResponseStatus(NO_CONTENT)
    public void delete(@AuthenticationPrincipal UserPrincipal principal,
                       @PathVariable(name = "id") Long id) {
        interviewService.deleteInterview(principal.getId(), id);
    }
}

