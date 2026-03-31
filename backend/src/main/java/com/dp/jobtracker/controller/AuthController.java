package com.dp.jobtracker.controller;

import com.dp.jobtracker.model.dto.auth.AuthResponseDto;
import com.dp.jobtracker.model.dto.auth.ForgotPasswordRequestDto;
import com.dp.jobtracker.model.dto.auth.LoginRequestDto;
import com.dp.jobtracker.model.dto.auth.PasswordUpdateRequestDto;
import com.dp.jobtracker.model.dto.auth.RefreshTokenRequestDto;
import com.dp.jobtracker.model.dto.auth.RegisterRequestDto;
import com.dp.jobtracker.model.dto.auth.ResetPasswordRequestDto;
import com.dp.jobtracker.security.UserPrincipal;
import com.dp.jobtracker.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> register(@RequestBody @Valid RegisterRequestDto dto) {
        AuthResponseDto response = authService.register(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@RequestBody @Valid LoginRequestDto dto) {
        AuthResponseDto response = authService.login(dto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDto> refresh(@RequestBody @Valid RefreshTokenRequestDto dto) {
        AuthResponseDto response = authService.refresh(dto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestBody @Valid RefreshTokenRequestDto dto) {
        authService.logout(dto);
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Map<String, String>> updatePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody @Valid PasswordUpdateRequestDto dto) {
        authService.updatePassword(principal.getId(), dto);
        return ResponseEntity.ok(Map.of("message", "Password updated"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @RequestBody @Valid ForgotPasswordRequestDto dto) {
        authService.forgotPassword(dto);
        return ResponseEntity.ok(Map.of("message", "If the email is registered, you will receive instructions"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @RequestBody @Valid ResetPasswordRequestDto dto) {
        authService.resetPassword(dto);
        return ResponseEntity.ok(Map.of("message", "Password has been reset"));
    }
}
