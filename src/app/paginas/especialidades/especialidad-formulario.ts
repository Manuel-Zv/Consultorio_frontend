import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DIALOGO_DATOS, DialogoRef } from '../../compartido/servicios/dialogo.service';
import { Especialidad } from '../../nucleo/modelos/especialidad.model';

@Component({
  selector: 'app-especialidad-formulario',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './especialidad-formulario.html',
})
export class EspecialidadFormulario {
  private referencia = inject(DialogoRef<Partial<Especialidad>>);
  protected datos: Especialidad | null = inject(DIALOGO_DATOS) as Especialidad | null;

  readonly formulario = inject(FormBuilder).group({
    nombre: [this.datos?.nombre ?? '', Validators.required],
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
    this.referencia.close(this.formulario.getRawValue() as Partial<Especialidad>);
  }
}
