import { Service, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, switchMap, throwError } from 'rxjs';
import { SessionUser } from '../interfaces/user';
import { API_URL } from '../utils/api';
import { Customer } from '../interfaces/customer';

@Service()
export class AuthService {
  private http = inject(HttpClient);
  private url = `${API_URL}/auth`;

  // The "lobby screen": whoever is logged in right now (never includes the password)
  private currentUserSubject = new BehaviorSubject<SessionUser | null>(this.loadFromSession());
  readonly currentUser$ = this.currentUserSubject.asObservable();

  // The API checks the password against its BCrypt hash and never sends the hash back
  login(email: string, password: string): Observable<SessionUser | null> {
    return this.http.post<SessionUser>(`${this.url}/login`, { email, password }).pipe(
      // 401 means wrong email or password; anything else is a real error
      catchError((err: HttpErrorResponse) =>
        err.status === 401 ? of(null) : throwError(() => err),
      ),
      switchMap((user) => {
        if (!user) return of(null);

        // Admins don't have a customer account to check
        if (user.role !== 'customer' || user.customerId == null) return of(user);

        // Customers can only log in while their account is active
        return this.http.get<Customer>(`${API_URL}/customers/${user.customerId}`).pipe(
          map((customer) => {
            if (customer.status !== 'active') {
              throw new Error(
                `This account is ${customer.status}. Please call customer care at 1-800-555-0100.`,
              );
            }
            return user;
          }),
        );
      }),
      map((user) => (user ? this.startSession(user) : null)),
    );
  }

  // The API matches the customer, blocks duplicates, and hashes the password
  register(accountNumber: string, email: string, password: string): Observable<SessionUser> {
    return this.http
      .post<SessionUser>(`${this.url}/register`, { accountNumber, email, password })
      .pipe(
        // 404 (no matching customer) and 409 (account already exists) come back as { message }
        catchError((err: HttpErrorResponse) =>
          throwError(() => (err.error?.message ? new Error(err.error.message) : err)),
        ),
        map((user) => this.startSession(user)),
      );
  }

  logout(): void {
    sessionStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): SessionUser | null {
    return this.currentUserSubject.value;
  }

  private loadFromSession(): SessionUser | null {
    const saved = sessionStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  }

  // The API already left out the password, so the user can be stored as-is
  private startSession(user: SessionUser): SessionUser {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
    return user;
  }
}
