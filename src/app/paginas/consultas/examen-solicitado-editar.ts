import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DIALOGO_DATOS, DialogoRef } from '../../compartido/servicios/dialogo.service';
import { ExamenSolicitado } from '../../nucleo/modelos/examen-solicitado.model';

@Component({
  selector: 'app-examen-solicitado-editar',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './examen-solicitado-editar.html',
})
export class ExamenSolicitadoEditar {
  private referencia = inject(DialogoRef<Partial<ExamenSolicitado>>);
  protected datos: ExamenSolicitado = inject(DIALOGO_DATOS) as ExamenSolicitado;

  readonly formulario = inject(FormBuilder).group({
    estado: [this.datos.estado, Validators.required],
    resultado: [this.datos.resultado ?? ''],
    fecha_resultado: [this.datos.fecha_resultado?.substring(0, 10) ?? ''],
  });

  cerrar(): void {
    this.referencia.close(undefined);
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const valores = this.formulario.getRawValue();
    this.referencia.close({
      ...valores,
      fecha_resultado: valores.fecha_resultado ? new Date(valores.fecha_resultado).toISOString() : undefined,
    } as unknown as Partial<ExamenSolicitado>);
  }
}
