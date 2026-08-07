import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs';
import { AutenticacionService } from '../../nucleo/servicios/autenticacion.service';
import { RolUsuario } from '../../nucleo/modelos/usuario.model';

interface OpcionMenu {
  etiqueta: string;
  ruta: string;
  icono: string;
  // Sin esta propiedad, la opcion es visible para los 3 roles.
  roles?: RolUsuario[];
}

// Espeja las restricciones reales del backend (ver routers de Express) para
// que nadie vea en el menu un enlace que solo le va a devolver 403 al abrirlo.
// Administrador = administracion del sistema (catalogos y cuentas de
// medico/paciente), no operativa clinica del dia a dia: por eso Citas y
// Consultas quedan fuera de su menu (y del backend, ver CitaRouter/
// ConsultaRouter — no es solo cosmetico).
const OPCIONES_MENU: OpcionMenu[] = [
  { etiqueta: 'Inicio', ruta: '/panel', icono: 'dashboard' },
  { etiqueta: 'Citas', ruta: '/panel/citas', icono: 'event', roles: ['medico', 'paciente'] },
  { etiqueta: 'Consultas', ruta: '/panel/consultas', icono: 'medical_information', roles: ['medico', 'paciente'] },
  { etiqueta: 'Pacientes', ruta: '/panel/pacientes', icono: 'personal_injury', roles: ['administrador', 'medico'] },
  { etiqueta: 'Médicos', ruta: '/panel/medicos', icono: 'medical_services' },
  { etiqueta: 'Especialidades', ruta: '/panel/especialidades', icono: 'local_hospital', roles: ['administrador', 'medico'] },
  { etiqueta: 'Medicamentos', ruta: '/panel/medicamentos', icono: 'medication', roles: ['administrador', 'medico'] },
  { etiqueta: 'Exámenes', ruta: '/panel/examenes', icono: 'science', roles: ['administrador', 'medico'] },
];

@Component({
  selector: 'app-layout-principal',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './layout-principal.html',
  styleUrl: './layout-principal.scss',
})
export class LayoutPrincipal {
  protected autenticacionService = inject(AutenticacionService);

  readonly opciones = computed(() => {
    const rol = this.autenticacionService.usuario()?.rol;
    return OPCIONES_MENU.filter((opcion) => !opcion.roles || (rol && opcion.roles.includes(rol)));
  });

  private breakpointObserver = inject(BreakpointObserver);

  // En pantallas angostas la barra lateral se superpone y arranca cerrada;
  // en escritorio queda fija al costado.
  readonly esMovil = toSignal(
    this.breakpointObserver.observe(Breakpoints.Handset).pipe(map((resultado) => resultado.matches)),
    { initialValue: false }
  );

  readonly sidebarAbierta = signal(false);

  readonly iniciales = computed(() => {
    const nombre = this.autenticacionService.usuario()?.nombre ?? '';
    return nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase())
      .join('');
  });

  constructor(private router: Router) {}

  alternarSidebar(): void {
    this.sidebarAbierta.set(!this.sidebarAbierta());
  }

  cerrarSidebarSiMovil(): void {
    if (this.esMovil()) this.sidebarAbierta.set(false);
  }

  cerrarSesion(): void {
    this.autenticacionService.cerrarSesion();
    this.router.navigate(['/iniciar-sesion']);
  }
}
