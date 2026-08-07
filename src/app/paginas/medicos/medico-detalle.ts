import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MedicoService } from '../../nucleo/servicios/medico.service';
import { CitaService } from '../../nucleo/servicios/cita.service';
import { AutenticacionService } from '../../nucleo/servicios/autenticacion.service';
import { ToastService } from '../../compartido/servicios/toast.service';
import { Medico } from '../../nucleo/modelos/medico.model';
import { Cita, EstadoCita } from '../../nucleo/modelos/cita.model';

@Component({
  selector: 'app-medico-detalle',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './medico-detalle.html',
})
export class MedicoDetalle implements OnInit {
  protected autenticacionService = inject(AutenticacionService);
  readonly medico = signal<Medico | null>(null);
  readonly citas = signal<Cita[]>([]);
  readonly cargando = signal(true);

  // Ver comentario en ngOnInit: solo tiene sentido pedir/mostrar el
  // historial cuando el medico logueado ve su propio perfil.
  readonly esPropioPerfil = computed(
    () => this.autenticacionService.esMedico() && this.autenticacionService.usuario()?.medico_id === this.medico()?.id
  );

  constructor(
    private ruta: ActivatedRoute,
    private router: Router,
    private medicoService: MedicoService,
    private citaService: CitaService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const id = Number(this.ruta.snapshot.paramMap.get('id'));
    this.cargando.set(true);
    this.medicoService.obtener(id).subscribe({
      next: (medico) => this.medico.set(medico),
      error: (error) => {
        this.toast.errorHttp(error, 'No se pudo cargar el médico');
        this.router.navigate(['/panel/medicos']);
      },
    });

    // El backend fuerza "mis propias citas" sin importar el medico_id que se
    // mande (paciente -> las suyas, medico -> las suyas, administrador ->
    // 403, ya no tiene acceso a /citas). Por eso esta seccion solo tiene
    // sentido cuando un medico ve su propio perfil: en cualquier otro caso
    // (paciente, admin, o un medico viendo a otro medico) los datos que
    // devolvería el backend no corresponderían a este medico.
    if (!(this.autenticacionService.esMedico() && this.autenticacionService.usuario()?.medico_id === id)) {
      this.cargando.set(false);
      return;
    }
    this.citaService.listar({ medico_id: id }).subscribe({
      next: (citas) => {
        this.citas.set(citas);
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
