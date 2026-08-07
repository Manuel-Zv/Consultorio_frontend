import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TablaDatos } from '../../compartido/utilidades/tabla-datos';
import { Paginador } from '../../compartido/componentes/paginador';
import { DialogoService } from '../../compartido/servicios/dialogo.service';
import { ToastService } from '../../compartido/servicios/toast.service';
import { PacienteService } from '../../nucleo/servicios/paciente.service';
import { Paciente } from '../../nucleo/modelos/paciente.model';
import { PacienteFormulario } from './paciente-formulario';
import { ConfirmarDialogo } from '../../compartido/componentes/confirmar-dialogo';

@Component({
  selector: 'app-pacientes-lista',
  standalone: true,
  imports: [RouterLink, Paginador],
  templateUrl: './pacientes-lista.html',
})
export class PacientesLista implements OnInit {
  readonly tabla = new TablaDatos<Paciente>([]);
  readonly cargando = signal(false);

  constructor(
    private pacienteService: PacienteService,
    private dialogo: DialogoService,
    private toast: ToastService
  ) {
    this.tabla.filterPredicate = (item, filtro) =>
      `${item.numero_identificacion} ${item.nombres} ${item.apellidos} ${item.correo_electronico}`
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
    this.pacienteService.listar().subscribe({
      next: (datos) => {
        this.tabla.data = datos;
        this.cargando.set(false);
      },
      error: (error) => {
        this.cargando.set(false);
        this.toast.errorHttp(error, 'No se pudieron cargar los pacientes');
      },
    });
  }

  nuevo(): void {
    const referencia = this.dialogo.abrir<PacienteFormulario, Paciente | null, Partial<Paciente>>(
      PacienteFormulario,
      { ancho: 'lg' }
    );
    referencia.afterClosed().subscribe((resultado) => {
      if (!resultado) return;
      this.pacienteService.crear(resultado).subscribe({
        next: () => {
          this.toast.exito('Paciente creado');
          this.cargar();
        },
        error: (error) => this.toast.errorHttp(error, 'No se pudo crear el paciente'),
      });
    });
  }

  editar(paciente: Paciente): void {
    const referencia = this.dialogo.abrir<PacienteFormulario, Paciente, Partial<Paciente>>(PacienteFormulario, {
      ancho: 'lg',
      data: paciente,
    });
    referencia.afterClosed().subscribe((resultado) => {
      if (!resultado) return;
      this.pacienteService.actualizar(paciente.id, resultado).subscribe({
        next: () => {
          this.toast.exito('Paciente actualizado');
          this.cargar();
        },
        error: (error) => this.toast.errorHttp(error, 'No se pudo actualizar el paciente'),
      });
    });
  }

  eliminar(paciente: Paciente): void {
    const referencia = this.dialogo.abrir<ConfirmarDialogo, unknown, boolean>(ConfirmarDialogo, {
      data: { titulo: 'Eliminar paciente', mensaje: `¿Eliminar a "${paciente.nombres} ${paciente.apellidos}"?` },
    });
    referencia.afterClosed().subscribe((confirmado) => {
      if (!confirmado) return;
      this.pacienteService.eliminar(paciente.id).subscribe(() => {
        this.toast.exito('Paciente eliminado');
        this.cargar();
      });
    });
  }
}
