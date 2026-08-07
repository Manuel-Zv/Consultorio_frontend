import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DIALOGO_DATOS, DialogoRef } from '../../compartido/servicios/dialogo.service';
import { Paciente } from '../../nucleo/modelos/paciente.model';

@Component({
  selector: 'app-paciente-formulario',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './paciente-formulario.html',
})
export class PacienteFormulario {
  private referencia = inject(DialogoRef<Partial<Paciente>>);
  protected datos: Paciente | null = inject(DIALOGO_DATOS) as Paciente | null;
  /** Tope del <input type="date"> — no se permiten fechas de nacimiento futuras. */
  protected readonly hoy = new Date().toISOString().substring(0, 10);

  readonly formulario = inject(FormBuilder).group({
    numero_identificacion: [this.datos?.numero_identificacion ?? '', Validators.required],
    nombres: [this.datos?.nombres ?? '', Validators.required],
    apellidos: [this.datos?.apellidos ?? '', Validators.required],
    fecha_nacimiento: [this.datos?.fecha_nacimiento?.substring(0, 10) ?? '', Validators.required],
    sexo: [this.datos?.sexo ?? '', Validators.required],
    correo_electronico: [this.datos?.correo_electronico ?? '', [Validators.required, Validators.email]],
    telefono: [this.datos?.telefono ?? ''],
    direccion: [this.datos?.direccion ?? ''],
    tipo_paciente: [this.datos?.tipo_paciente ?? '', Validators.required],
  });

  cerrar(): void {
    this.referencia.close(undefined);
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.referencia.close(this.formulario.getRawValue() as unknown as Partial<Paciente>);
  }
}
