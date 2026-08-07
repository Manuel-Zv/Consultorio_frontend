import { Component, OnInit, inject, signal } from '@angular/core';
import { TablaDatos } from '../../compartido/utilidades/tabla-datos';
import { Paginador } from '../../compartido/componentes/paginador';
import { DialogoService } from '../../compartido/servicios/dialogo.service';
import { ToastService } from '../../compartido/servicios/toast.service';
import { EspecialidadService } from '../../nucleo/servicios/especialidad.service';
import { Especialidad } from '../../nucleo/modelos/especialidad.model';
import { EspecialidadFormulario } from './especialidad-formulario';
import { ConfirmarDialogo } from '../../compartido/componentes/confirmar-dialogo';
import { AutenticacionService } from '../../nucleo/servicios/autenticacion.service';

@Component({
  selector: 'app-especialidades-lista',
  standalone: true,
  imports: [Paginador],
  templateUrl: './especialidades-lista.html',
})
export class EspecialidadesLista implements OnInit {
  protected autenticacionService = inject(AutenticacionService);
  readonly tabla = new TablaDatos<Especialidad>([]);
  readonly cargando = signal(false);

  constructor(
    private especialidadService: EspecialidadService,
    private dialogo: DialogoService,
    private toast: ToastService
  ) {
    this.tabla.filterPredicate = (item, filtro) =>
      `${item.nombre} ${item.descripcion ?? ''}`.toLowerCase().includes(filtro);
  }

  aplicarFiltro(evento: Event): void {
    this.tabla.filter = (evento.target as HTMLInputElement).value.trim().toLowerCase();
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.especialidadService.listar().subscribe({
      next: (datos) => {
        this.tabla.data = datos;
        this.cargando.set(false);
      },
      error: (error) => {
        this.cargando.set(false);
        this.toast.errorHttp(error, 'No se pudieron cargar las especialidades');
      },
    });
  }

  nueva(): void {
    const referencia = this.dialogo.abrir<EspecialidadFormulario, Especialidad | null, Partial<Especialidad>>(
      EspecialidadFormulario
    );
    referencia.afterClosed().subscribe((resultado) => {
      if (!resultado) return;
      this.especialidadService.crear(resultado).subscribe({
        next: () => {
          this.toast.exito('Especialidad creada');
          this.cargar();
        },
        error: (error) => this.toast.errorHttp(error, 'No se pudo crear la especialidad'),
      });
    });
  }

  editar(especialidad: Especialidad): void {
    const referencia = this.dialogo.abrir<EspecialidadFormulario, Especialidad, Partial<Especialidad>>(
      EspecialidadFormulario,
      { data: especialidad }
    );
    referencia.afterClosed().subscribe((resultado) => {
      if (!resultado) return;
      this.especialidadService.actualizar(especialidad.id, resultado).subscribe({
        next: () => {
          this.toast.exito('Especialidad actualizada');
          this.cargar();
        },
        error: (error) => this.toast.errorHttp(error, 'No se pudo actualizar la especialidad'),
      });
    });
  }

  eliminar(especialidad: Especialidad): void {
    const referencia = this.dialogo.abrir<ConfirmarDialogo, unknown, boolean>(ConfirmarDialogo, {
      data: { titulo: 'Eliminar especialidad', mensaje: `¿Eliminar "${especialidad.nombre}"?` },
    });
    referencia.afterClosed().subscribe((confirmado) => {
      if (!confirmado) return;
      this.especialidadService.eliminar(especialidad.id).subscribe(() => {
        this.toast.exito('Especialidad eliminada');
        this.cargar();
      });
    });
  }
}
