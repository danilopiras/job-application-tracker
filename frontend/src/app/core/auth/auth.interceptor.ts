import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, finalize, shareReplay, switchMap, throwError } from 'rxjs';

import { AuthService } from './auth.service';

let refreshInFlight: Observable<unknown> | null = null;

function isAuthEndpointNoBearer(url: string): boolean {
  return (
    url.includes('/api/auth/login') ||
    url.includes('/api/auth/register') ||
    url.includes('/api/auth/refresh') ||
    url.includes('/api/auth/forgot-password') ||
    url.includes('/api/auth/reset-password')
  );
}

function refreshOnce(auth: AuthService): Observable<unknown> {
  if (!refreshInFlight) {
    const rt = auth.refreshToken;
    if (!rt) {
      return throwError(() => new Error('No refresh token'));
    }
    refreshInFlight = auth.refresh({ refreshToken: rt }).pipe(
      catchError((err) => {
        auth.clear();
        return throwError(() => err);
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
      finalize(() => {
        refreshInFlight = null;
      }),
    );
  }
  return refreshInFlight;
}

function sendWithToken(req: HttpRequest<unknown>, next: HttpHandlerFn, token: string | null): Observable<HttpEvent<unknown>> {
  const withAuth =
    token && req.url.startsWith('http')
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;
  return next(withAuth);
}

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const auth = inject(AuthService);

  if (isAuthEndpointNoBearer(req.url)) {
    return next(req);
  }

  const retryAfter401 = (): Observable<HttpEvent<unknown>> => {
    const refreshToken = auth.refreshToken;
    if (!refreshToken) {
      auth.clear();
      return throwError(() => new HttpErrorResponse({ status: 401 }));
    }
    return refreshOnce(auth).pipe(
      switchMap(() => {
        const nextToken = auth.accessToken;
        if (!nextToken) {
          auth.clear();
          return throwError(() => new HttpErrorResponse({ status: 401 }));
        }
        return sendWithToken(req, next, nextToken);
      }),
    );
  };

  const pipeline = (): Observable<HttpEvent<unknown>> =>
    sendWithToken(req, next, auth.accessToken).pipe(
      catchError((err: unknown) => {
        if (!(err instanceof HttpErrorResponse)) return throwError(() => err);
        if (err.status !== 401) return throwError(() => err);
        return retryAfter401();
      }),
    );

  if (auth.shouldRefreshAccessToken()) {
    return refreshOnce(auth).pipe(switchMap(() => pipeline()));
  }

  return pipeline();
}
