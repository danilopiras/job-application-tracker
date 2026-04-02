import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, of, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AuthResponseDto,
  ForgotPasswordRequestDto,
  LoginRequestDto,
  PasswordUpdateRequestDto,
  RefreshTokenRequestDto,
  RegisterRequestDto,
  ResetPasswordRequestDto,
} from './auth.types';

type StoredAuth = {
  token: string;
  expiresAt: string;
  refreshToken: string;
  refreshExpiresAt: string;
  userId: number;
  email: string;
};

const STORAGE_KEY = 'auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private authSignal = signal<StoredAuth | null>(this.readStored());

  readonly auth = this.authSignal.asReadonly();
  readonly isAuthenticated = computed(() => {
    const a = this.authSignal();
    if (!a) return false;
    const now = Date.now();
    if (now < new Date(a.expiresAt).getTime()) return true;
    return now < new Date(a.refreshExpiresAt).getTime();
  });

  get accessToken(): string | null {
    return this.authSignal()?.token ?? null;
  }

  get refreshToken(): string | null {
    return this.authSignal()?.refreshToken ?? null;
  }

  shouldRefreshAccessToken(bufferMs = 60_000): boolean {
    const a = this.authSignal();
    if (!a?.refreshToken) return false;
    if (Date.now() >= new Date(a.refreshExpiresAt).getTime()) return false;
    return Date.now() >= new Date(a.expiresAt).getTime() - bufferMs;
  }

  login(dto: LoginRequestDto) {
    return this.http.post<AuthResponseDto>(`${environment.apiBaseUrl}/api/auth/login`, dto).pipe(
      tap((res) => this.persist(res)),
    );
  }

  register(dto: RegisterRequestDto) {
    return this.http.post<AuthResponseDto>(`${environment.apiBaseUrl}/api/auth/register`, dto).pipe(
      tap((res) => this.persist(res)),
    );
  }

  refresh(dto: RefreshTokenRequestDto) {
    return this.http.post<AuthResponseDto>(`${environment.apiBaseUrl}/api/auth/refresh`, dto).pipe(
      tap((res) => this.persist(res)),
    );
  }

  logout() {
    const refreshToken = this.refreshToken;
    this.clear();
    if (!refreshToken) {
      return of(void 0);
    }
    return this.http
      .post(`${environment.apiBaseUrl}/api/auth/logout`, { refreshToken })
      .pipe(map(() => void 0));
  }

  forgotPassword(dto: ForgotPasswordRequestDto) {
    return this.http.post(`${environment.apiBaseUrl}/api/auth/forgot-password`, dto);
  }

  resetPassword(dto: ResetPasswordRequestDto) {
    return this.http.post(`${environment.apiBaseUrl}/api/auth/reset-password`, dto);
  }

  updatePassword(dto: PasswordUpdateRequestDto) {
    return this.http.put(`${environment.apiBaseUrl}/api/auth/me/password`, dto);
  }

  clear() {
    localStorage.removeItem(STORAGE_KEY);
    this.authSignal.set(null);
  }

  private persist(res: AuthResponseDto) {
    const stored: StoredAuth = {
      token: res.token,
      expiresAt: res.expiresAt,
      refreshToken: res.refreshToken,
      refreshExpiresAt: res.refreshExpiresAt,
      userId: res.userId,
      email: res.email,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    this.authSignal.set(stored);
  }

  private readStored(): StoredAuth | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredAuth;
    } catch {
      return null;
    }
  }
}

