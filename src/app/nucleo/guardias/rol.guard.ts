import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AutenticacionService } from '../servicios/autenticacion.service';
import { ToastService } from '../../compartido/servicios/toast.service';
import { RolUsuario } from '../modelos/usuario.model';

/**
 * Bloquea una ruta a nivel de frontend para roles que el backend ya rechazaría
 * igual (ver verifyRol en las rutas Express) — evita que un paciente/medico
 * llegue a una pantalla que solo va a mostrarle errores 403 en cada petición.
 * Uso: canActivate: [rolGuard('administrador', 'medico')]
 */
export const rolGuard =
  (...rolesPermitidos: RolUsuario[]): CanActivateFn =>
  () => {
    const autenticacionService = inject(AutenticacionService);
    const router = inject(Router);
    const toast = inject(ToastService);

    const rol = autenticacionService.usuario()?.rol;
    if (rol && rolesPermitidos.includes(rol)) {
      return true;
    }
    toast.error('No tienes permiso para acceder a esa sección');
    router.navigate(['/panel']);
    return false;
  };