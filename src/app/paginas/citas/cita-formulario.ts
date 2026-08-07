import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DIALOGO_DATOS, DialogoRef } from '../../compartido/servicios/dialogo.service';
import { Cita } from '../../nucleo/modelos/cita.model';
import { Paciente } from '../../nucleo/modelos/paciente.model';
import { Medico } from '../../nucleo/modelos/medico.model';
import { PacienteService } from '../../nucleo/servicios/paciente.service';
import { MedicoService } from '../../nucleo/servicios/medico.service';
import { AutenticacionService } from '../../nucleo/servicios/autenticacion.service';

@Component({
  selector: 'app-cita-formulario',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './cita-formulario.html',
})
export class CitaFormulario implements OnInit {
  private referencia = inject(DialogoRef<Partial<Cita>>);
  protected datos: Cita | null = inject(DIALOGO_DATOS) as Cita | null;
  private pacienteService = inject(PacienteService);
  private medicoService = inject(MedicoService);
  private autenticacionService = inject(AutenticacionService);

  // GET /api/pacientes esta prohibido para el rol paciente (backend, 403): un
  // paciente jamas ve el selector de "Paciente", siempre agenda para si mismo.
  protected readonly esPaciente = this.autenticacionService.esPaciente;

  readonly pacientes = signal<Paciente[]>([]);
  readonly medicos = signal<Medico[]>([]);

  // Solo se exige fecha futura al crear una cita nueva; al editar una ya
  // existente (por ejemplo una atendida en el pasado) no se restringe,
  // para no invalidar una fecha que ya estaba guardada.
  protected readonly fechaMinima = this.datos ? null : new Date().toISOString().substring(0, 10);

  readonly formulario = inject(FormBuilder).group({
    paciente_id: [
      this.datos?.paciente_id ?? (this.esPaciente() ? this.autenticacionService.usuario()?.paciente_id ?? null : null),
      Validators.required,
    ],
    medico_id: [this.datos?.medico_id ?? null, Validators.required],
    fecha: [this.datos ? this.datos.fecha_hora_atencion.substring(0, 10) : '', Validators.required],
    hora: [this.datos ? this.formatoHora(this.datos.fecha_hora_atencion) : '', Validators.required],
    modalidad: [this.datos?.modalidad ?? '', Validators.required],
    motivo_consulta: [this.datos?.motivo_consulta ?? '', Validators.required],
  });

  ngOnInit(): void {
    // Un paciente no puede listar /pacientes (403): el backend igual ignora
    // cualquier paciente_id que mande y usa el suyo propio del token.
    if (!this.esPaciente()) {
      this.pacienteService.listar().subscribe((datos) => this.pacientes.set(datos));
    }
    this.medicoService.listar().subscribe((datos) => this.medicos.set(datos));
  }

  private formatoHora(fechaIso: string): string {
    const fecha = new Date(fechaIso);
    return `${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}`;
  }

  cerrar(): void {
    this.referencia.close(undefined);
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const valores = this.formulario.getRawValue();
    const fecha = new Date(`${valores.fecha}T${valores.hora || '00:00'}:00`);

    this.referencia.close({
      paciente_id: valores.paciente_id!,
      medico_id: valores.medico_id!,
      modalidad: valores.modalidad as Cita['modalidad'],
      motivo_consulta: valores.motivo_consulta!,
      fecha_hora_atencion: fecha.toISOString(),
    });
  }
}
