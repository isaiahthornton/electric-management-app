import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../auth-service';
import { API_URL } from '../../utils/api';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  const jane = { id: 2, email: 'jane@example.com', password: 'jane123', role: 'customer', customerId: 1 };
  const admin = { id: 1, email: 'support@thornenergy.com', password: 'admin123', role: 'admin', customerId: null };

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify(); // fails the test if a request was made that we didn't expect
    sessionStorage.clear();
  });

  it('logs in an admin and never saves the password', () => {
    let result: unknown;
    service.login(admin.email, admin.password).subscribe((u) => (result = u));

    http.expectOne(`${API_URL}/users?email=${admin.email}&password=${admin.password}`).flush([admin]);

    expect(result).toEqual({ id: 1, email: admin.email, role: 'admin', customerId: null });
    expect(sessionStorage.getItem('currentUser')).not.toContain('password');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('returns null for a wrong email or password', () => {
    let result: unknown = 'not set';
    service.login('nobody@example.com', 'wrong').subscribe((u) => (result = u));

    http.expectOne(() => true).flush([]);

    expect(result).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });

  it('logs in an active customer', () => {
    let result: unknown;
    service.login(jane.email, jane.password).subscribe((u) => (result = u));

    http.expectOne(() => true).flush([jane]);
    http.expectOne(`${API_URL}/customers/1`).flush({ id: 1, status: 'active' });

    expect(result).toMatchObject({ email: jane.email, role: 'customer' });
    expect(service.getCurrentUser()).not.toHaveProperty('password');
  });

  it('blocks a suspended customer from logging in', () => {
    let error: Error | undefined;
    service.login(jane.email, jane.password).subscribe({ error: (e) => (error = e) });

    http.expectOne(() => true).flush([jane]);
    http.expectOne(`${API_URL}/customers/1`).flush({ id: 1, status: 'suspended' });

    expect(error?.message).toContain('This account is suspended');
    expect(service.isLoggedIn()).toBe(false);
    expect(sessionStorage.getItem('currentUser')).toBeNull();
  });

  it('logout clears the session', () => {
    service.login(admin.email, admin.password).subscribe();
    http.expectOne(() => true).flush([admin]);

    service.logout();

    expect(service.isLoggedIn()).toBe(false);
    expect(sessionStorage.getItem('currentUser')).toBeNull();
  });
});
