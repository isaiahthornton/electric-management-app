import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { User } from '../interfaces/user';
import { API_URL } from '../utils/api';


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
          sessionStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
        return user;
      })
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
}


