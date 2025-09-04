import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/authService';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const session = authService.getSession();
  if (!session || !session.token) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
