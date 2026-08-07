import { Component, input } from '@angular/core';
import { PaginacionControlable } from '../utilidades/tabla-datos';

/** Barra de paginación Tailwind para usar junto a `TablaDatos` (reemplaza mat-paginator). */
@Component({
  selector: 'app-paginador',
  standalone: true,
  template: `
    @if (tabla().filteredData.length > 0) {
      <div class="paginador">
        <span class="paginador-info">
          {{ inicio() }}–{{ fin() }} de {{ tabla().filteredData.length }}
        </span>
        <div class="paginador-controles">
          <button
            type="button"
            class="btn-icon"
            [disabled]="tabla().pagina() === 0"
            (click)="tabla().primeraPagina()"
            title="Primera página"
          >
            <span class="material-icons">first_page</span>
          </button>
          <button
            type="button"
            class="btn-icon"
            [disabled]="tabla().pagina() === 0"
            (click)="tabla().paginaAnterior()"
            title="Anterior"
          >
            <span class="material-icons">chevron_left</span>
          </button>
          <span class="paginador-pagina">Página {{ tabla().pagina() + 1 }} de {{ tabla().totalPaginas }}</span>
          <button
            type="button"
            class="btn-icon"
            [disabled]="tabla().pagina() >= tabla().totalPaginas - 1"
            (click)="tabla().paginaSiguiente()"
            title="Siguiente"
          >
            <span class="material-icons">chevron_right</span>
          </button>
          <button
            type="button"
            class="btn-icon"
            [disabled]="tabla().pagina() >= tabla().totalPaginas - 1"
            (click)="tabla().irAPagina(tabla().totalPaginas - 1)"
            title="Última página"
          >
            <span class="material-icons">last_page</span>
          </button>
        </div>
      </div>
    }
  `,
})
export class Paginador {
  readonly tabla = input.required<PaginacionControlable>();

  protected inicio(): number {
    return this.tabla().pagina() * this.tabla().tamanioPagina() + 1;
  }

  protected fin(): number {
    return Math.min(
      (this.tabla().pagina() + 1) * this.tabla().tamanioPagina(),
      this.tabla().filteredData.length
    );
  }
}
