import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service';

export const authGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.getCurrentUser();

  if (!user) {
    return router.createUrlTree(['/login']);
  }
    const requiredRole = route.data['role'] as string | undefined;
  if (requiredRole && user.role !== requiredRole) {
    return router.createUrlTree([user.role === 'admin' ? '/admin' : '/account']);
  }

  return true;
};
