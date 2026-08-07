import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AutenticacionService } from '../servicios/autenticacion.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const autenticacionService = inject(AutenticacionService);
  const token = autenticacionService.obtenerToken();

  if (!token) {
    return next(req);
  }

  const clonada = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
  return next(clonada);
};
