import { Component, HostListener, ViewChild, ViewContainerRef, inject } from '@angular/core';
import { DialogoService } from '../servicios/dialogo.service';

/**
 * Contenedor único de diálogos, montado una sola vez en el shell de la app.
 * `DialogoService.abrir()` crea el componente pedido dentro del
 * `ng-container` de aquí, envuelto en el backdrop + tarjeta.
 *
 * El `ng-container` NUNCA se saca del árbol con `@if` (a diferencia del
 * resto del overlay): si estuviera condicionado a `servicio.abierto()`,
 * el `ViewChild` nunca se resolvería la primera vez porque `abierto()`
 * solo se vuelve `true` *después* de que `abrir()` ya necesitó el
 * contenedor — dependencia circular. En vez de eso, el `ng-container`
 * vive siempre en el DOM y solo se oculta con CSS vía la clase `activo`.
 */
@Component({
  selector: 'app-dialogo-host',
  standalone: true,
  template: `
    <div class="dialogo-overlay" [class.activo]="servicio.abierto()">
      <div class="dialogo-backdrop" (click)="servicio.cerrarActual()"></div>
      <div class="dialogo-panel" [class.dialogo-panel-lg]="servicio.anchoActual() === 'lg'">
        <ng-container #contenedor></ng-container>
      </div>
    </div>
  `,
})
export class DialogoHost {
  protected readonly servicio = inject(DialogoService);

  @ViewChild('contenedor', { read: ViewContainerRef, static: true })
  private set contenedor(vc: ViewContainerRef) {
    this.servicio.registrarContenedor(vc);
  }

  @HostListener('document:keydown.escape')
  protected alPresionarEscape(): void {
    this.servicio.cerrarActual();
  }
}
