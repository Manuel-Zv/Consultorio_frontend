import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TablaDatos } from '../../compartido/utilidades/tabla-datos';
import { Paginador } from '../../compartido/componentes/paginador';
import { DialogoService } from '../../compartido/servicios/dialogo.service';
import { ToastService } from '../../compartido/servicios/toast.service';
import { CitaService } from '../../nucleo/servicios/cita.service';
import { Cita, EstadoCita } from '../../nucleo/modelos/cita.model';
import { CitaFormulario } from './cita-formulario';
import { ConfirmarDialogo } from '../../compartido/componentes/confirmar-dialogo';
import { AutenticacionService } from '../../nucleo/servicios/autenticacion.service';

const ESTADOS: EstadoCita[] = ['solicitada', 'confirmada', 'atendida', 'cancelada', 'no_asistida'];

@Component({
  selector: 'app-citas-lista',
  standalone: true,
  imports: [DatePipe, FormsModule, Paginador],
  templateUrl: './citas-lista.html',
})
export class CitasLista implements OnInit {
  protected autenticacionService = inject(AutenticacionService);
  readonly tabla = new TablaDatos<Cita>([]);
  readonly cargando = signal(false);
  readonly estadosDisponibles = ESTADOS;
  filtroEstado: EstadoCita | '' = '';

  constructor(
    private citaService: CitaService,
    private dialogo: DialogoService,
    private toast: ToastService,
    private router: Router
  ) {
    this.tabla.filterPredicate = (item, filtro) =>
      `${item.paciente?.nombres ?? ''} ${item.paciente?.apellidos ?? ''} ${item.medico?.nombres ?? ''} ${item.medico?.apellidos ?? ''} ${item.motivo_consulta}`
        .toLowerCase()
        .includes(filtro);
  }

  aplicarFiltro(evento: Event): void {
    this.tabla.filter = (evento.target as HTMLInputElement).value.trim().toLowerCase();
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.citaService.listar(this.filtroEstado ? { estado: this.filtroEstado } : undefined).subscribe({
      next: (datos) => {
        this.tabla.data = datos;
        this.cargando.set(false);
      },
      error: (error) => {
        this.cargando.set(false);
        this.toast.errorHttp(error, 'No se pudieron cargar las citas');
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

  nueva(): void {
    const referencia = this.dialogo.abrir<CitaFormulario, Cita | null, Partial<Cita>>(CitaFormulario, {
      ancho: 'lg',
    });
    referencia.afterClosed().subscribe((resultado) => {
      if (!resultado) return;
      this.citaService.crear(resultado).subscribe({
        next: () => {
          this.toast.exito('Cita creada');
          this.cargar();
        },
        error: (error) => this.toast.errorHttp(error, 'No se pudo crear la cita'),
      });
    });
  }

  editar(cita: Cita): void {
    const referencia = this.dialogo.abrir<CitaFormulario, Cita, Partial<Cita>>(CitaFormulario, {
      ancho: 'lg',
      data: cita,
    });
    referencia.afterClosed().subscribe((resultado) => {
      if (!resultado) return;
      this.citaService.actualizar(cita.id, resultado).subscribe({
        next: () => {
          this.toast.exito('Cita actualizada');
          this.cargar();
        },
        error: (error) => this.toast.errorHttp(error, 'No se pudo actualizar la cita'),
      });
    });
  }

  cambiarEstado(cita: Cita, estado: EstadoCita): void {
    this.citaService.cambiarEstado(cita.id, estado).subscribe(() => {
      this.toast.exito('Estado de la cita actualizado');
      this.cargar();
    });
  }

  registrarConsulta(cita: Cita): void {
    this.router.navigate(['/panel/consultas/nueva'], { queryParams: { cita_id: cita.id } });
  }

  eliminar(cita: Cita): void {
    const referencia = this.dialogo.abrir<ConfirmarDialogo, unknown, boolean>(ConfirmarDialogo, {
      data: { titulo: 'Cancelar cita', mensaje: '¿Deseas marcar esta cita como cancelada?' },
    });
    referencia.afterClosed().subscribe((confirmado) => {
      if (!confirmado) return;
      this.citaService.eliminar(cita.id).subscribe(() => {
        this.toast.exito('Cita cancelada');
        this.cargar();
      });
    });
  }
}
