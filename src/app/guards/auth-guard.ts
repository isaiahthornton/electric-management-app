import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.getCurrentUser();

  // Not logged in: send to login, but remember where they were headed
  if (!user) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }
  const requiredRole = route.data['role'] as string | undefined;
  if (requiredRole && user.role !== requiredRole) {
    return router.createUrlTree([user.role === 'admin' ? '/admin' : '/account']);
  }

  return true;
};
