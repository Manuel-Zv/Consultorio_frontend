import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DIALOGO_DATOS, DialogoRef } from '../../compartido/servicios/dialogo.service';
import { Medicamento } from '../../nucleo/modelos/medicamento.model';

@Component({
  selector: 'app-medicamento-formulario',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './medicamento-formulario.html',
})
export class MedicamentoFormulario {
  private referencia = inject(DialogoRef<Partial<Medicamento>>);
  protected datos: Medicamento | null = inject(DIALOGO_DATOS) as Medicamento | null;

  readonly formulario = inject(FormBuilder).group({
    codigo: [this.datos?.codigo ?? '', Validators.required],
    nombre: [this.datos?.nombre ?? '', Validators.required],
    presentacion: [this.datos?.presentacion ?? ''],
    concentracion: [this.datos?.concentracion ?? ''],
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
    this.referencia.close(this.formulario.getRawValue() as Partial<Medicamento>);
  }
}
