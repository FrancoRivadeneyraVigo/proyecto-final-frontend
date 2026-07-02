import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/internal/operators/filter';
import { take } from 'rxjs/operators';

export const adminGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Espera a que termine la comprobación inicial de sesión
  // (importante tras una recarga directa de la página)
  await firstValueFrom(
    toObservable(authService.authChecked).pipe(
      filter((checked) => checked),
      take(1)
    )
  );

  if (authService.currentUser()?.rol === 'admin') {
    return true;
  }

  router.navigate(['/home']);
  return false;
};
