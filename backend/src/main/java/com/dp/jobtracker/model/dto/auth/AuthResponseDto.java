package com.dp.jobtracker.model.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDto {

    private String token;
    private Date expiresAt;
    private String refreshToken;
    private Date refreshExpiresAt;
    private Long userId;
    private String email;
}
