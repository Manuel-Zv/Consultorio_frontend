import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PacienteService } from '../../nucleo/servicios/paciente.service';
import { MedicoService } from '../../nucleo/servicios/medico.service';
import { CitaService } from '../../nucleo/servicios/cita.service';
import { ConsultaService } from '../../nucleo/servicios/consulta.service';
import { MedicamentoService } from '../../nucleo/servicios/medicamento.service';
import { ExamenService } from '../../nucleo/servicios/examen.service';
import { AutenticacionService } from '../../nucleo/servicios/autenticacion.service';
import { ToastService } from '../../compartido/servicios/toast.service';
import { Cita, EstadoCita } from '../../nucleo/modelos/cita.model';

interface Estadistica {
  etiqueta: string;
  valor: number;
  icono: string;
  color: string;
  ruta: string;
}

const ESTADOS_ACTIVOS: EstadoCita[] = ['solicitada', 'confirmada'];

@Component({
  selector: 'app-panel-inicio',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './panel-inicio.html',
  styleUrl: './panel-inicio.scss',
})
export class PanelInicio implements OnInit {
  protected autenticacionService = inject(AutenticacionService);
  private pacienteService = inject(PacienteService);
  private medicoService = inject(MedicoService);
  private citaService = inject(CitaService);
  private consultaService = inject(ConsultaService);
  private medicamentoService = inject(MedicamentoService);
  private examenService = inject(ExamenService);
  private toast = inject(ToastService);

  readonly cargando = signal(true);
  readonly estadisticas = signal<Estadistica[]>([]);
  // Solo se usa en el dashboard de medico: agenda de hoy ordenada por hora.
  readonly agendaHoy = signal<Cita[]>([]);
  // Solo se usa en el dashboard de paciente.
  readonly proximaCita = signal<Cita | null>(null);

  readonly primerNombre = computed(() => this.autenticacionService.usuario()?.nombre?.split(' ')[0] ?? '');

  ngOnInit(): void {
    if (this.autenticacionService.esAdministrador()) {
      this.cargarAdministrador();
    } else if (this.autenticacionService.esMedico()) {
      this.cargarMedico();
    } else {
      this.cargarPaciente();
    }
  }

  // ---- Administrador: administracion del sistema (catalogos y cuentas de
  // medico/paciente). No incluye citas/consultas: eso es operativa clinica
  // exclusiva de medico/paciente, el backend ya se lo bloquea (403). ---------
  private cargarAdministrador(): void {
    forkJoin({
      pacientes: this.pacienteService.listar(),
      medicos: this.medicoService.listar(),
      medicamentos: this.medicamentoService.listar(),
      examenes: this.examenService.listar(),
    }).subscribe({
      next: ({ pacientes, medicos, medicamentos, examenes }) => {
        this.estadisticas.set([
          { etiqueta: 'Pacientes', valor: pacientes.length, icono: 'personal_injury', color: 'stat-azul', ruta: '/panel/pacientes' },
          { etiqueta: 'Médicos', valor: medicos.length, icono: 'medical_services', color: 'stat-verde', ruta: '/panel/medicos' },
          { etiqueta: 'Medicamentos', valor: medicamentos.length, icono: 'medication', color: 'stat-morado', ruta: '/panel/medicamentos' },
          { etiqueta: 'Exámenes', valor: examenes.length, icono: 'science', color: 'stat-naranja', ruta: '/panel/examenes' },
        ]);
        this.cargando.set(false);
      },
      error: (error) => this.manejarError(error),
    });
  }

  // ---- Medico: su propia agenda (el backend ya filtra citas/consultas
  // por medico_id del token, aqui solo se calculan los totales) -----------
  private cargarMedico(): void {
    forkJoin({
      citas: this.citaService.listar(),
      consultas: this.consultaService.listar(),
    }).subscribe({
      next: ({ citas, consultas }) => {
        const hoy = new Date().toDateString();
        this.agendaHoy.set(
          citas
            .filter(
              (c) =>
                new Date(c.fecha_hora_atencion).toDateString() === hoy &&
                c.estado !== 'cancelada' &&
                c.estado !== 'no_asistida'
            )
            .sort((a, b) => new Date(a.fecha_hora_atencion).getTime() - new Date(b.fecha_hora_atencion).getTime())
        );

        const pacientesAtendidos = new Set(
          citas.filter((c) => c.estado === 'atendida').map((c) => c.paciente_id)
        ).size;

        this.estadisticas.set([
          { etiqueta: 'Citas de hoy', valor: this.agendaHoy().length, icono: 'event', color: 'stat-azul', ruta: '/panel/citas' },
          { etiqueta: 'Citas pendientes', valor: this.contarPendientes(citas), icono: 'pending_actions', color: 'stat-naranja', ruta: '/panel/citas' },
          { etiqueta: 'Pacientes atendidos', valor: pacientesAtendidos, icono: 'personal_injury', color: 'stat-verde', ruta: '/panel/pacientes' },
          { etiqueta: 'Consultas registradas', valor: consultas.length, icono: 'medical_information', color: 'stat-morado', ruta: '/panel/consultas' },
        ]);
        this.cargando.set(false);
      },
      error: (error) => this.manejarError(error),
    });
  }

  // ---- Paciente: su proxima cita y su historial (tambien auto-filtrado
  // por paciente_id del token en el backend) ------------------------------
  private cargarPaciente(): void {
    forkJoin({
      citas: this.citaService.listar(),
      consultas: this.consultaService.listar(),
    }).subscribe({
      next: ({ citas, consultas }) => {
        const ahora = Date.now();
        const proximas = citas
          .filter(
            (c) =>
              c.estado !== 'cancelada' &&
              c.estado !== 'no_asistida' &&
              new Date(c.fecha_hora_atencion).getTime() >= ahora
          )
          .sort((a, b) => new Date(a.fecha_hora_atencion).getTime() - new Date(b.fecha_hora_atencion).getTime());
        this.proximaCita.set(proximas[0] ?? null);

        this.estadisticas.set([
          { etiqueta: 'Próximas citas', valor: proximas.length, icono: 'event', color: 'stat-azul', ruta: '/panel/citas' },
          { etiqueta: 'Citas pendientes', valor: this.contarPendientes(citas), icono: 'pending_actions', color: 'stat-naranja', ruta: '/panel/citas' },
          { etiqueta: 'Consultas en mi historial', valor: consultas.length, icono: 'medical_information', color: 'stat-morado', ruta: '/panel/consultas' },
        ]);
        this.cargando.set(false);
      },
      error: (error) => this.manejarError(error),
    });
  }

  private contarPendientes(citas: Cita[]): number {
    return citas.filter((c) => ESTADOS_ACTIVOS.includes(c.estado)).length;
  }

  private manejarError(error: unknown): void {
    this.cargando.set(false);
    this.toast.errorHttp(error, 'No se pudo cargar el resumen de inicio');
  }

  colorEstado(estado: EstadoCita): string {
    switch (estado) {
      case 'confirmada':
        return 'estado-confirmada';
      case 'atendida':
        return 'estado-atendida';
      case 'cancelada':
      case 'no_asistida':
        return 'estado-cancelada';
      default:
        return 'estado-solicitada';
    }
  }
}
