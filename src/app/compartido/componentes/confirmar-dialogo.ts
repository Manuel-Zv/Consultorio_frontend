import { Component, inject } from '@angular/core';
import { DIALOGO_DATOS, DialogoRef } from '../servicios/dialogo.service';

export interface DatosConfirmarDialogo {
  titulo: string;
  mensaje: string;
}

@Component({
  selector: 'app-confirmar-dialogo',
  standalone: true,
  template: `
    <div class="dialogo-cabecera">
      <h2>{{ datos.titulo }}</h2>
    </div>
    <div class="dialogo-confirmar-contenido">{{ datos.mensaje }}</div>
    <div class="dialogo-acciones">
      <button type="button" class="btn-outline" (click)="referencia.close(false)">Cancelar</button>
      <button type="button" class="btn-danger" (click)="referencia.close(true)">Confirmar</button>
    </div>
  `,
  styles: [
    `
      .dialogo-confirmar-contenido {
        padding: 20px 24px;
        color: var(--color-texto-secundario);
        min-width: 320px;
      }
    `,
  ],
})
export class ConfirmarDialogo {
  protected referencia = inject(DialogoRef<boolean>);
  protected datos: DatosConfirmarDialogo = inject(DIALOGO_DATOS) as DatosConfirmarDialogo;
}
