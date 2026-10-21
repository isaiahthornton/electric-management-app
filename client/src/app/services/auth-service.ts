import { Service, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, of, throwError } from 'rxjs';
import { SessionUser } from '../interfaces/user';
import { AuthResponse } from '../interfaces/auth';
import { API_URL } from '../utils/api';

// sessionStorage keys (cleared automatically when the tab closes)
export const AUTH_STORAGE = {
  user: 'currentUser',
  token: 'authToken',
  expiresAt: 'authExpiresAt',
} as const;

@Service()
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private url = `${API_URL}/auth`;
  private expiryTimer?: ReturnType<typeof setTimeout>;

  // The "lobby screen": whoever is logged in right now (never includes the password)
  private currentUserSubject = new BehaviorSubject<SessionUser | null>(this.restoreSession());
  readonly currentUser$ = this.currentUserSubject.asObservable();

  // The API checks the password against its BCrypt hash and answers with a signed JWT
  login(email: string, password: string): Observable<SessionUser | null> {
    return this.http.post<AuthResponse>(`${this.url}/login`, { email, password }).pipe(
      map((auth) => this.startSession(auth)),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) return of(null); // wrong email or password
        return throwError(() => this.toError(err)); // e.g. 403: account suspended
      }),
    );
  }

  // The API matches the customer, blocks duplicates, hashes the password, and signs them in
  register(accountNumber: string, email: string, password: string): Observable<SessionUser> {
    return this.http
      .post<AuthResponse>(`${this.url}/register`, { accountNumber, email, password })
      .pipe(
        map((auth) => this.startSession(auth)),
        catchError((err: HttpErrorResponse) => throwError(() => this.toError(err))),
      );
  }

  logout(): void {
    clearTimeout(this.expiryTimer);
    Object.values(AUTH_STORAGE).forEach((key) => sessionStorage.removeItem(key));
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): SessionUser | null {
    return this.currentUserSubject.value;
  }

  // The interceptor calls this on every request; an expired token counts as no token
  getToken(): string | null {
    const token = sessionStorage.getItem(AUTH_STORAGE.token);
    const expiresAt = Number(sessionStorage.getItem(AUTH_STORAGE.expiresAt));
    return token && Date.now() < expiresAt ? token : null;
  }

  private startSession(auth: AuthResponse): SessionUser {
    const expiresAt = Date.parse(auth.expiresAt);
    sessionStorage.setItem(AUTH_STORAGE.user, JSON.stringify(auth.user));
    sessionStorage.setItem(AUTH_STORAGE.token, auth.token);
    sessionStorage.setItem(AUTH_STORAGE.expiresAt, String(expiresAt));
    this.scheduleExpiry(expiresAt);
    this.currentUserSubject.next(auth.user);
    return auth.user;
  }

  // On a page refresh, keep the session only if its token is still valid
  private restoreSession(): SessionUser | null {
    const saved = sessionStorage.getItem(AUTH_STORAGE.user);
    if (!saved || !this.getToken()) {
      Object.values(AUTH_STORAGE).forEach((key) => sessionStorage.removeItem(key));
      return null;
    }
    this.scheduleExpiry(Number(sessionStorage.getItem(AUTH_STORAGE.expiresAt)));
    return JSON.parse(saved);
  }

  // Log out automatically the moment the token expires
  private scheduleExpiry(expiresAt: number): void {
    clearTimeout(this.expiryTimer);
    this.expiryTimer = setTimeout(() => {
      this.logout();
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
    }, Math.max(expiresAt - Date.now(), 0));
  }

  // The API explains refusals in { message }; turn that into an Error the components can display
  private toError(err: HttpErrorResponse): Error | HttpErrorResponse {
    return err.error?.message ? new Error(err.error.message) : err;
  }
}
