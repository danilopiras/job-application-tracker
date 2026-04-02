import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, catchError, throwError } from 'rxjs';

import { TranslocoService } from '@jsverse/transloco';

function extractMessage(err: HttpErrorResponse): string | null {
  const body = err.error as any;
  if (body && typeof body === 'object') {
    if (typeof body.message === 'string' && body.message.trim()) return body.message;
    if (typeof body.error === 'string' && body.error.trim()) return body.error;
  }
  if (typeof err.message === 'string' && err.message.trim()) return err.message;
  return null;
}

export function errorSnackbarInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const snack = inject(MatSnackBar);
  const i18n = inject(TranslocoService);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        const silent =
          req.url.includes('/api/auth/refresh') ||
          req.url.includes('/api/auth/logout') ||
          req.url.includes('/api/auth/forgot-password');

        if (!silent) {
          const extracted = extractMessage(err);
          const msg =
            extracted !== null && extracted !== ''
              ? extracted
              : err.status === 0
                ? i18n.translate('errors.network')
                : i18n.translate('errors.generic');
          snack.open(msg, i18n.translate('common.dismiss'), { duration: 4500 });
        }
      }
      return throwError(() => err);
    }),
  );
}

