import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { authInterceptor } from './auth-interceptor';
import { AuthService } from '../services/auth-service';
import { API_URL } from '../utils/api';

describe('authInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let auth: { getToken: ReturnType<typeof vi.fn>; logout: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(() => {
    // A fake AuthService: the test decides whether anyone is "logged in" and can see if logout was called
    auth = { getToken: vi.fn().mockReturnValue('abc.def.ghi'), logout: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: auth },
      ],
    });

    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true); // do not really navigate in a test
  });

  afterEach(() => controller.verify());

  it('adds the Bearer token to requests to our API', () => {
    http.get(`${API_URL}/bills`).subscribe();

    const req = controller.expectOne(`${API_URL}/bills`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc.def.ghi');
    req.flush([]);
  });

  it('does not send the token to any other site', () => {
    http.get('https://example.com/data').subscribe();

    const req = controller.expectOne('https://example.com/data');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('sends no Authorization header when nobody is logged in', () => {
    auth.getToken.mockReturnValue(null);

    http.get(`${API_URL}/ratePlans`).subscribe();

    const req = controller.expectOne(`${API_URL}/ratePlans`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('logs out and goes to the login page when the API answers 401', () => {
    http.get(`${API_URL}/bills`).subscribe({ error: () => undefined });

    controller.expectOne(`${API_URL}/bills`).flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(auth.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], expect.anything());
  });

  it('does not log out when a wrong password makes the login call return 401', () => {
    http.post(`${API_URL}/auth/login`, {}).subscribe({ error: () => undefined });

    controller.expectOne(`${API_URL}/auth/login`).flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(auth.logout).not.toHaveBeenCalled();
  });

  it('does not log out for other errors, such as 403 or 500', () => {
    http.get(`${API_URL}/customers`).subscribe({ error: () => undefined });

    controller.expectOne(`${API_URL}/customers`).flush({}, { status: 403, statusText: 'Forbidden' });

    expect(auth.logout).not.toHaveBeenCalled();
  });
});
