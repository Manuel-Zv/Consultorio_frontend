import { Component, inject } from '@angular/core';
import { ToastService } from '../servicios/toast.service';

/** Pila de notificaciones flotantes, montada una sola vez en el shell de la app. */
@Component({
  selector: 'app-toast-host',
  standalone: true,
  template: `
    <div class="toast-contenedor">
      @for (toast of servicio.toasts(); track toast.id) {
        <div class="toast" [class]="'toast-' + toast.tipo">
          <span class="material-icons toast-icono">
            {{ toast.tipo === 'exito' ? 'check_circle' : toast.tipo === 'error' ? 'error' : 'info' }}
          </span>
          <span class="toast-mensaje">{{ toast.mensaje }}</span>
          <button type="button" class="toast-cerrar" (click)="servicio.descartar(toast.id)" aria-label="Cerrar">
            <span class="material-icons">close</span>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastHost {
  protected readonly servicio = inject(ToastService);
}
