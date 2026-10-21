import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../auth-service';
import { API_URL } from '../../utils/api';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  // What the API returns: the user without any password
  const jane = { id: 2, email: 'jane@example.com', role: 'customer', customerId: 1 };
  const admin = { id: 1, email: 'support@thornenergy.com', role: 'admin', customerId: null };

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

  it('logs in an admin by POSTing credentials to the API', () => {
    let result: unknown;
    service.login(admin.email, 'admin123').subscribe((u) => (result = u));

    const req = http.expectOne(`${API_URL}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: admin.email, password: 'admin123' });
    req.flush(admin);

    expect(result).toEqual(admin);
    expect(sessionStorage.getItem('currentUser')).not.toContain('password');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('returns null when the API says 401', () => {
    let result: unknown = 'not set';
    service.login('nobody@example.com', 'wrong').subscribe((u) => (result = u));

    http
      .expectOne(`${API_URL}/auth/login`)
      .flush({ message: 'Invalid email or password.' }, { status: 401, statusText: 'Unauthorized' });

    expect(result).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });

  it('logs in an active customer', () => {
    let result: unknown;
    service.login(jane.email, 'jane123').subscribe((u) => (result = u));

    http.expectOne(`${API_URL}/auth/login`).flush(jane);
    http.expectOne(`${API_URL}/customers/1`).flush({ id: 1, status: 'active' });

    expect(result).toMatchObject({ email: jane.email, role: 'customer' });
    expect(service.getCurrentUser()).not.toHaveProperty('password');
  });

  it('blocks a suspended customer from logging in', () => {
    let error: Error | undefined;
    service.login(jane.email, 'jane123').subscribe({ error: (e) => (error = e) });

    http.expectOne(`${API_URL}/auth/login`).flush(jane);
    http.expectOne(`${API_URL}/customers/1`).flush({ id: 1, status: 'suspended' });

    expect(error?.message).toContain('This account is suspended');
    expect(service.isLoggedIn()).toBe(false);
    expect(sessionStorage.getItem('currentUser')).toBeNull();
  });

  it('registers a customer and starts a session', () => {
    service.register('TE-100001', jane.email, 'jane123').subscribe();

    const req = http.expectOne(`${API_URL}/auth/register`);
    expect(req.request.body).toEqual({ accountNumber: 'TE-100001', email: jane.email, password: 'jane123' });
    req.flush(jane);

    expect(service.isLoggedIn()).toBe(true);
  });

  it("shows the API's message when registration is refused", () => {
    let error: Error | undefined;
    service.register('TE-100001', jane.email, 'jane123').subscribe({ error: (e) => (error = e) });

    http
      .expectOne(`${API_URL}/auth/register`)
      .flush(
        { message: 'A user account already exists for this customer.' },
        { status: 409, statusText: 'Conflict' },
      );

    expect(error?.message).toBe('A user account already exists for this customer.');
    expect(service.isLoggedIn()).toBe(false);
  });

  it('logout clears the session', () => {
    service.login(admin.email, 'admin123').subscribe();
    http.expectOne(`${API_URL}/auth/login`).flush(admin);

    service.logout();

    expect(service.isLoggedIn()).toBe(false);
    expect(sessionStorage.getItem('currentUser')).toBeNull();
  });
});
