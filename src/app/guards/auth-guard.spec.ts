import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { authGuard } from './auth-guard';

describe('authGuard', () => {
  // Runs the guard inside Angular so inject() works
  const runGuard = (role: string, url: string) => {
    const route = { data: { role } } as unknown as ActivatedRouteSnapshot;
    const state = { url } as RouterStateSnapshot;
    return TestBed.runInInjectionContext(() =>
      (authGuard as CanActivateFn)(route, state),
    );
  };

  // AuthService reads sessionStorage when it's created, so set it up before configuring
  const loginAs = (role: 'admin' | 'customer' | null) => {
    sessionStorage.clear();
    if (role) {
      const user = { id: 1, email: 'test@example.com', role, customerId: role === 'customer' ? 1 : null };
      sessionStorage.setItem('currentUser', JSON.stringify(user));
    }
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
  };

  afterEach(() => sessionStorage.clear());

  it('sends logged-out users to /login with a returnUrl', () => {
    loginAs(null);
    const result = runGuard('customer', '/account/billing');
    const router = TestBed.inject(Router);

    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/login?returnUrl=%2Faccount%2Fbilling');
  });

  it('sends a customer away from admin pages to /account', () => {
    loginAs('customer');
    const result = runGuard('admin', '/admin');
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/account');
  });

  it('sends an admin away from customer pages to /admin', () => {
    loginAs('admin');
    const result = runGuard('customer', '/account');
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/admin');
  });

  it('lets a user with the right role through', () => {
    loginAs('customer');
    expect(runGuard('customer', '/account')).toBe(true);
  });
});
