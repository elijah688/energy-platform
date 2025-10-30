import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/users';

export const transactionGuard: CanActivateFn = (route, state) => {
  const energy = inject(UserService);
  const router = inject(Router);

  if (energy.selecterUsers().length === 2) {
    return true;
  } else {
    router.navigate(['/list']); // redirect if not enough users
    return false;
  }
};
