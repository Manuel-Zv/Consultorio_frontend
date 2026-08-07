import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DIALOGO_DATOS, DialogoRef } from '../../compartido/servicios/dialogo.service';
import { Medico } from '../../nucleo/modelos/medico.model';
import { Especialidad } from '../../nucleo/modelos/especialidad.model';
import { EspecialidadService } from '../../nucleo/servicios/especialidad.service';

@Component({
  selector: 'app-medico-formulario',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './medico-formulario.html',
})
export class MedicoFormulario implements OnInit {
  private referencia = inject(DialogoRef<Partial<Medico>>);
  protected datos: Medico | null = inject(DIALOGO_DATOS) as Medico | null;
  private especialidadService = inject(EspecialidadService);

  readonly especialidades = signal<Especialidad[]>([]);

  readonly formulario = inject(FormBuilder).group({
    numero_identificacion: [this.datos?.numero_identificacion ?? '', Validators.required],
    nombres: [this.datos?.nombres ?? '', Validators.required],
    apellidos: [this.datos?.apellidos ?? '', Validators.required],
    correo_electronico: [this.datos?.correo_electronico ?? '', [Validators.required, Validators.email]],
    telefono: [this.datos?.telefono ?? ''],
    numero_licencia: [this.datos?.numero_licencia ?? '', Validators.required],
    especialidad_id: [this.datos?.especialidad_id ?? null, Validators.required],
  });

  ngOnInit(): void {
    this.especialidadService.listar().subscribe((datos) => this.especialidades.set(datos));
  }

  cerrar(): void {
    this.referencia.close(undefined);
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.referencia.close(this.formulario.getRawValue() as Partial<Medico>);
  }
}
