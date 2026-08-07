import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PacienteService } from '../../nucleo/servicios/paciente.service';
import { CitaService } from '../../nucleo/servicios/cita.service';
import { ToastService } from '../../compartido/servicios/toast.service';
import { AutenticacionService } from '../../nucleo/servicios/autenticacion.service';
import { Paciente } from '../../nucleo/modelos/paciente.model';
import { Cita, EstadoCita } from '../../nucleo/modelos/cita.model';

@Component({
  selector: 'app-paciente-detalle',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './paciente-detalle.html',
})
export class PacienteDetalle implements OnInit {
  protected autenticacionService = inject(AutenticacionService);
  readonly paciente = signal<Paciente | null>(null);
  readonly citas = signal<Cita[]>([]);
  readonly cargando = signal(true);
  // Administrador ya no tiene acceso a /citas (ver ConsultaRouter/CitaRouter):
  // esta seccion no se pide ni se muestra para ese rol.
  readonly puedeVerCitas = this.autenticacionService.esMedico() || this.autenticacionService.esPaciente();

  constructor(
    private ruta: ActivatedRoute,
    private router: Router,
    private pacienteService: PacienteService,
    private citaService: CitaService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const id = Number(this.ruta.snapshot.paramMap.get('id'));
    this.cargando.set(true);
    this.pacienteService.obtener(id).subscribe({
      next: (paciente) => this.paciente.set(paciente),
      error: (error) => {
        this.toast.errorHttp(error, 'No se pudo cargar el paciente');
        this.router.navigate(['/panel']);
      },
    });

    if (!this.puedeVerCitas) {
      this.cargando.set(false);
      return;
    }

    // El backend fuerza "mis propias citas" segun el token, ignorando el
    // paciente_id que se mande: para un medico eso es TODAS sus citas (con
    // cualquier paciente), no las de este paciente en particular. Se filtran
    // aqui en el cliente para mostrar solo el cruce medico-paciente correcto.
    // Para un paciente viendo su propio perfil, el backend ya le fuerza las
    // suyas, asi que el filtro es un no-op.
    this.citaService.listar({ paciente_id: id }).subscribe({
      next: (citas) => {
        this.citas.set(citas.filter((c) => c.paciente_id === id));
        this.cargando.set(false);
      },
      error: (error) => {
        this.cargando.set(false);
        this.toast.errorHttp(error, 'No se pudo cargar el historial de citas');
      },
    });
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

  verConsulta(cita: Cita): void {
    if (cita.consulta) {
      this.router.navigate(['/panel/consultas', cita.consulta.id]);
    }
  }
}
