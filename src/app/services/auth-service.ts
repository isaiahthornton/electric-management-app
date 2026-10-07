import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, switchMap, tap } from 'rxjs';
import { User } from '../interfaces/user';
import { API_URL } from '../utils/api';
import { Customer } from '../interfaces/customer';


@Service()
export class AuthService {
  private http = inject(HttpClient);
  private url = `${API_URL}/users`;

  //The "lobby screen": whoever is logged in, we will store their info here.
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadFromSession());
  readonly currentUser$ = this.currentUserSubject.asObservable();

  login(email: string, password: string): Observable<User | null> {
    return this.http
    .get<User[]>(`${this.url}?email=${email}&password=${password}`)
    .pipe(
      map(users => {
        const user = users[0] ?? null;
        if (user) {
          this.startSession(user);
        }
        return user;
      })
    );
  }
  register(accountNumber: string, email: string, password: string): Observable<User> {
    return this.http
    .get<Customer[]>(`${API_URL}/customers?accountNumber=${accountNumber}&email=${email}`)
    .pipe(
      switchMap(customers => {
        const customer = customers[0];
        if (!customer) {
          throw new Error('Customer not found with provided account number and email.');
        }
        return this.http.get<User[]>(`${this.url}?customerId=${customer.id}`).pipe(
          switchMap(existing => {
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
      tap((user) => this.startSession(user)),
    );
  }
  logout(): void {
    sessionStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
  private loadFromSession(): User | null {
    const saved = sessionStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  }
  private startSession(user: User): void {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
}


