package com.dp.jobtracker.service;

import com.dp.jobtracker.model.dto.auth.AuthResponseDto;
import com.dp.jobtracker.model.dto.auth.ForgotPasswordRequestDto;
import com.dp.jobtracker.model.dto.auth.LoginRequestDto;
import com.dp.jobtracker.model.dto.auth.PasswordUpdateRequestDto;
import com.dp.jobtracker.model.dto.auth.RefreshTokenRequestDto;
import com.dp.jobtracker.model.dto.auth.RegisterRequestDto;
import com.dp.jobtracker.model.dto.auth.ResetPasswordRequestDto;

public interface AuthService {

    AuthResponseDto register(RegisterRequestDto dto);

    AuthResponseDto login(LoginRequestDto dto);

    AuthResponseDto refresh(RefreshTokenRequestDto dto);

    void logout(RefreshTokenRequestDto dto);

    void updatePassword(Long userId, PasswordUpdateRequestDto dto);

    void forgotPassword(ForgotPasswordRequestDto dto);

    void resetPassword(ResetPasswordRequestDto dto);
}
