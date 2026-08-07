import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DIALOGO_DATOS, DialogoRef } from '../../compartido/servicios/dialogo.service';
import { Examen } from '../../nucleo/modelos/examen.model';

@Component({
  selector: 'app-examen-formulario',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './examen-formulario.html',
})
export class ExamenFormulario {
  private referencia = inject(DialogoRef<Partial<Examen>>);
  protected datos: Examen | null = inject(DIALOGO_DATOS) as Examen | null;

  readonly formulario = inject(FormBuilder).group({
    codigo: [this.datos?.codigo ?? '', Validators.required],
    nombre: [this.datos?.nombre ?? '', Validators.required],
    costo: [this.datos?.costo ?? 0, [Validators.required, Validators.min(0)]],
    descripcion: [this.datos?.descripcion ?? ''],
  });

  cerrar(): void {
    this.referencia.close(undefined);
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.referencia.close(this.formulario.getRawValue() as Partial<Examen>);
  }
}
