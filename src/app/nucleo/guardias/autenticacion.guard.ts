import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AutenticacionService } from '../servicios/autenticacion.service';

export const autenticacionGuard: CanActivateFn = () => {
  const autenticacionService = inject(AutenticacionService);
  const router = inject(Router);

  if (autenticacionService.estaAutenticado()) {
    return true;
  }
  router.navigate(['/iniciar-sesion']);
  return false;
};
