export type AuthResponseDto = {
  token: string;
  expiresAt: string;
  refreshToken: string;
  refreshExpiresAt: string;
  userId: number;
  email: string;
};

export type LoginRequestDto = {
  email: string;
  password: string;
};

export type RegisterRequestDto = {
  email: string;
  password: string;
};

export type RefreshTokenRequestDto = {
  refreshToken: string;
};

export type ForgotPasswordRequestDto = {
  email: string;
};

export type ResetPasswordRequestDto = {
  token: string;
  newPassword: string;
};

export type PasswordUpdateRequestDto = {
  currentPassword: string;
  newPassword: string;
};

