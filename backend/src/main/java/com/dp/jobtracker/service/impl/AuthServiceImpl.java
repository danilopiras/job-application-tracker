package com.dp.jobtracker.service.impl;

import com.dp.jobtracker.exception.BadRequestException;
import com.dp.jobtracker.exception.ResourceNotFoundException;
import com.dp.jobtracker.model.dto.auth.AuthResponseDto;
import com.dp.jobtracker.model.dto.auth.ForgotPasswordRequestDto;
import com.dp.jobtracker.model.dto.auth.LoginRequestDto;
import com.dp.jobtracker.model.dto.auth.PasswordUpdateRequestDto;
import com.dp.jobtracker.model.dto.auth.RefreshTokenRequestDto;
import com.dp.jobtracker.model.dto.auth.RegisterRequestDto;
import com.dp.jobtracker.model.dto.auth.ResetPasswordRequestDto;
import com.dp.jobtracker.model.entity.PasswordResetToken;
import com.dp.jobtracker.model.entity.RefreshToken;
import com.dp.jobtracker.model.entity.User;
import com.dp.jobtracker.repository.PasswordResetTokenRepository;
import com.dp.jobtracker.repository.RefreshTokenRepository;
import com.dp.jobtracker.repository.UserRepository;
import com.dp.jobtracker.security.JwtService;
import com.dp.jobtracker.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.Objects;
import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {

    private static final int RESET_TOKEN_EXPIRATION_HOURS = 1;
    private static final int RESET_TOKEN_BYTES = 48;

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.reset-password.base-url:http://localhost:4200/reset-password}")
    private String resetPasswordBaseUrl;

    @Override
    @Transactional
    public AuthResponseDto register(RegisterRequestDto dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        User user = new User();
        user.setEmail(dto.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        User saved = userRepository.save(user);
        return buildAuthResponse(saved);
    }

    @Override
    public AuthResponseDto login(LoginRequestDto dto) {
        User user = userRepository.findByEmail(dto.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));
        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }
        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public AuthResponseDto refresh(RefreshTokenRequestDto dto) {
        String rawRefreshToken = dto.getRefreshToken().trim();
        if (!jwtService.validateToken(rawRefreshToken) || !jwtService.isRefreshToken(rawRefreshToken)) {
            throw new BadRequestException("Invalid refresh token");
        }

        RefreshToken storedToken = refreshTokenRepository.findByToken(rawRefreshToken)
                .orElseThrow(() -> new BadRequestException("Refresh token not found"));
        if (storedToken.isRevoked()) {
            throw new BadRequestException("Refresh token revoked");
        }
        if (storedToken.getExpiresAt().isBefore(Instant.now())) {
            storedToken.setRevoked(true);
            refreshTokenRepository.save(storedToken);
            throw new BadRequestException("Refresh token expired");
        }

        // Rotate refresh token on each refresh.
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        return buildAuthResponse(storedToken.getUser());
    }

    @Override
    @Transactional
    public void logout(RefreshTokenRequestDto dto) {
        String rawRefreshToken = dto.getRefreshToken().trim();
        refreshTokenRepository.findByToken(rawRefreshToken).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    @Override
    @Transactional
    public void updatePassword(Long userId, PasswordUpdateRequestDto dto) {
        User user = userRepository.findById(Objects.requireNonNull(userId, "userId is required"))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequestDto dto) {
        String email = dto.getEmail().trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            log.info("Forgot password requested for non-existing email: {}", email);
            return;
        }
        User user = userOpt.get();
        String token = generateResetToken();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiresAt(Instant.now().plusSeconds(RESET_TOKEN_EXPIRATION_HOURS * 3600L));
        resetToken.setUsed(false);
        passwordResetTokenRepository.save(resetToken);

        String link = resetPasswordBaseUrl + "?token=" + token;
        SimpleMailMessage message = new SimpleMailMessage();
        // TODO: to delete in production
        message.setFrom("noreply@jobtracker.com");
        message.setTo(user.getEmail());
        message.setSubject("Password reset - Job Application Tracker");
        message.setText("To reset your password, use the following link (valid for " + RESET_TOKEN_EXPIRATION_HOURS + " hour(s)):\n\n" + link);
        try {
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Error while sending password reset email. userId={}, email={}, token={}", user.getId(), user.getEmail(), token, e);
        }
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequestDto dto) {
        Instant now = Instant.now();
        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByTokenAndUsedFalseAndExpiresAtAfter(dto.getToken().trim(), now)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }

    private AuthResponseDto buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshTokenValue = jwtService.generateRefreshToken(user);
        Date accessExpiresAt = jwtService.getExpirationFromToken(accessToken);
        Date refreshExpiresAt = jwtService.getExpirationFromToken(refreshTokenValue);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(refreshTokenValue);
        refreshToken.setUser(user);
        refreshToken.setRevoked(false);
        refreshToken.setExpiresAt(refreshExpiresAt.toInstant());
        refreshTokenRepository.save(refreshToken);

        return new AuthResponseDto(
                accessToken,
                accessExpiresAt,
                refreshTokenValue,
                refreshExpiresAt,
                user.getId(),
                user.getEmail()
        );
    }

    private static String generateResetToken() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[RESET_TOKEN_BYTES];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
