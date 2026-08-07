import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TablaDatos } from '../../compartido/utilidades/tabla-datos';
import { Paginador } from '../../compartido/componentes/paginador';
import { DialogoService } from '../../compartido/servicios/dialogo.service';
import { ToastService } from '../../compartido/servicios/toast.service';
import { MedicoService } from '../../nucleo/servicios/medico.service';
import { Medico } from '../../nucleo/modelos/medico.model';
import { MedicoFormulario } from './medico-formulario';
import { ConfirmarDialogo } from '../../compartido/componentes/confirmar-dialogo';
import { AutenticacionService } from '../../nucleo/servicios/autenticacion.service';

@Component({
  selector: 'app-medicos-lista',
  standalone: true,
  imports: [RouterLink, Paginador],
  templateUrl: './medicos-lista.html',
})
export class MedicosLista implements OnInit {
  protected autenticacionService = inject(AutenticacionService);
  readonly tabla = new TablaDatos<Medico>([]);
  readonly cargando = signal(false);

  constructor(
    private medicoService: MedicoService,
    private dialogo: DialogoService,
    private toast: ToastService
  ) {
    this.tabla.filterPredicate = (item, filtro) =>
      `${item.numero_identificacion} ${item.nombres} ${item.apellidos} ${item.correo_electronico} ${item.especialidad?.nombre ?? ''}`
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
    this.medicoService.listar().subscribe({
      next: (datos) => {
        this.tabla.data = datos;
        this.cargando.set(false);
      },
      error: (error) => {
        this.cargando.set(false);
        this.toast.errorHttp(error, 'No se pudieron cargar los médicos');
      },
    });
  }

  nuevo(): void {
    const referencia = this.dialogo.abrir<MedicoFormulario, Medico | null, Partial<Medico>>(MedicoFormulario, {
      ancho: 'lg',
    });
    referencia.afterClosed().subscribe((resultado) => {
      if (!resultado) return;
      this.medicoService.crear(resultado).subscribe({
        next: () => {
          this.toast.exito('Médico creado');
          this.cargar();
        },
        error: (error) => this.toast.errorHttp(error, 'No se pudo crear el médico'),
      });
    });
  }

  editar(medico: Medico): void {
    const referencia = this.dialogo.abrir<MedicoFormulario, Medico, Partial<Medico>>(MedicoFormulario, {
      ancho: 'lg',
      data: medico,
    });
    referencia.afterClosed().subscribe((resultado) => {
      if (!resultado) return;
      this.medicoService.actualizar(medico.id, resultado).subscribe({
        next: () => {
          this.toast.exito('Médico actualizado');
          this.cargar();
        },
        error: (error) => this.toast.errorHttp(error, 'No se pudo actualizar el médico'),
      });
    });
  }

  eliminar(medico: Medico): void {
    const referencia = this.dialogo.abrir<ConfirmarDialogo, unknown, boolean>(ConfirmarDialogo, {
      data: { titulo: 'Eliminar médico', mensaje: `¿Eliminar a "${medico.nombres} ${medico.apellidos}"?` },
    });
    referencia.afterClosed().subscribe((confirmado) => {
      if (!confirmado) return;
      this.medicoService.eliminar(medico.id).subscribe(() => {
        this.toast.exito('Médico eliminado');
        this.cargar();
      });
    });
  }
}
