import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, of, switchMap } from 'rxjs';
import { SessionUser, User } from '../interfaces/user';
import { API_URL } from '../utils/api';
import { Customer } from '../interfaces/customer';

@Service()
export class AuthService {
  private http = inject(HttpClient);
  private url = `${API_URL}/users`;

  // The "lobby screen": whoever is logged in right now (never includes the password)
  private currentUserSubject = new BehaviorSubject<SessionUser | null>(this.loadFromSession());
  readonly currentUser$ = this.currentUserSubject.asObservable();

  login(email: string, password: string): Observable<SessionUser | null> {
    return this.http.get<User[]>(`${this.url}?email=${email}&password=${password}`).pipe(
      switchMap((users) => {
        const user = users[0];
        if (!user) return of(null); // wrong email or password

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

  register(accountNumber: string, email: string, password: string): Observable<SessionUser> {
    return this.http
      .get<Customer[]>(`${API_URL}/customers?accountNumber=${accountNumber}&email=${email}`)
      .pipe(
        switchMap((customers) => {
          const customer = customers[0];
          if (!customer) {
            throw new Error('Customer not found with provided account number and email.');
          }
          return this.http.get<User[]>(`${this.url}?customerId=${customer.id}`).pipe(
            switchMap((existing) => {
              if (existing.length > 0) {
                throw new Error('A user account already exists for this customer.');
              }
              const newUser: Omit<User, 'id'> = {
                email,
                password,
                role: 'customer',
                customerId: customer.id,
              };
              return this.http.post<User>(this.url, newUser);
            }),
          );
        }),
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

  // Strip the password before it goes into sessionStorage, where any script on the page can read it
  private startSession(user: User): SessionUser {
    const { password: _password, ...safeUser } = user;
    sessionStorage.setItem('currentUser', JSON.stringify(safeUser));
    this.currentUserSubject.next(safeUser);
    return safeUser;
  }
}
