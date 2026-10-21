import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AUTH_STORAGE, AuthService } from '../auth-service';
import { API_URL } from '../../utils/api';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  // What the API returns: a token plus the user without any password
  const jane = { id: 2, email: 'jane@example.com', role: 'customer', customerId: 1 };
  const admin = { id: 1, email: 'support@thornenergy.com', role: 'admin', customerId: null };
  const inOneHour = () => new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const authFor = (user: object, expiresAt = inOneHour()) => ({
    token: 'header.payload.signature',
    expiresAt,
    user,
  });

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify(); // fails the test if a request was made that we didn't expect
    service.logout(); // also cancels the auto-logout timer
    sessionStorage.clear();
  });

  it('logs in by POSTing credentials and stores the token', () => {
    let result: unknown;
    service.login(admin.email, 'admin123').subscribe((u) => (result = u));

    const req = http.expectOne(`${API_URL}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: admin.email, password: 'admin123' });
    req.flush(authFor(admin));

    expect(result).toEqual(admin);
    expect(service.isLoggedIn()).toBe(true);
    expect(service.getToken()).toBe('header.payload.signature');
    expect(sessionStorage.getItem(AUTH_STORAGE.user)).not.toContain('password');
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

  it('shows the API message when a suspended customer is refused (403)', () => {
    let error: Error | undefined;
    service.login(jane.email, 'jane123').subscribe({ error: (e) => (error = e) });

    http.expectOne(`${API_URL}/auth/login`).flush(
      { message: 'This account is suspended. Please call customer care at 1-800-555-0100.' },
      { status: 403, statusText: 'Forbidden' },
    );

    expect(error?.message).toContain('This account is suspended');
    expect(service.isLoggedIn()).toBe(false);
    expect(service.getToken()).toBeNull();
  });

  it('registers a customer and starts a session', () => {
    service.register('TE-100001', jane.email, 'jane123').subscribe();

    const req = http.expectOne(`${API_URL}/auth/register`);
    expect(req.request.body).toEqual({ accountNumber: 'TE-100001', email: jane.email, password: 'jane123' });
    req.flush(authFor(jane));

    expect(service.isLoggedIn()).toBe(true);
    expect(service.getToken()).not.toBeNull();
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

  it('ignores a token that has already expired', () => {
    service.login(jane.email, 'jane123').subscribe();
    http.expectOne(`${API_URL}/auth/login`).flush(authFor(jane, new Date(Date.now() - 1000).toISOString()));

    expect(service.getToken()).toBeNull();
  });

  it('logout clears the token and the user', () => {
    service.login(admin.email, 'admin123').subscribe();
    http.expectOne(`${API_URL}/auth/login`).flush(authFor(admin));

    service.logout();

    expect(service.isLoggedIn()).toBe(false);
    expect(service.getToken()).toBeNull();
    expect(sessionStorage.getItem(AUTH_STORAGE.token)).toBeNull();
  });
});
