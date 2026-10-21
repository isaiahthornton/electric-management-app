import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth-service';
import { API_URL } from '../utils/api';

// Runs on every HttpClient request: attaches the JWT, and reacts when the API says it's no longer valid
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();

  // Only send the token to our own API, never to another site
  const request =
    token && req.url.startsWith(API_URL)
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(request).pipe(
    catchError((err: unknown) => {
      // 401 = token missing, expired or invalid. A wrong password also returns 401, so skip the login call.
      if (err instanceof HttpErrorResponse && err.status === 401 && !req.url.endsWith('/auth/login')) {
        auth.logout();
        router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
      }
      return throwError(() => err);
    }),
  );
};
