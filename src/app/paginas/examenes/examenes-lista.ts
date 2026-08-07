import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TablaDatos } from '../../compartido/utilidades/tabla-datos';
import { Paginador } from '../../compartido/componentes/paginador';
import { DialogoService } from '../../compartido/servicios/dialogo.service';
import { ToastService } from '../../compartido/servicios/toast.service';
import { ExamenService } from '../../nucleo/servicios/examen.service';
import { Examen } from '../../nucleo/modelos/examen.model';
import { ExamenFormulario } from './examen-formulario';
import { ConfirmarDialogo } from '../../compartido/componentes/confirmar-dialogo';
import { AutenticacionService } from '../../nucleo/servicios/autenticacion.service';

@Component({
  selector: 'app-examenes-lista',
  standalone: true,
  imports: [DecimalPipe, Paginador],
  templateUrl: './examenes-lista.html',
})
export class ExamenesLista implements OnInit {
  protected autenticacionService = inject(AutenticacionService);
  readonly tabla = new TablaDatos<Examen>([]);
  readonly cargando = signal(false);

  constructor(
    private examenService: ExamenService,
    private dialogo: DialogoService,
    private toast: ToastService
  ) {
    this.tabla.filterPredicate = (item, filtro) => `${item.codigo} ${item.nombre}`.toLowerCase().includes(filtro);
  }

  aplicarFiltro(evento: Event): void {
    this.tabla.filter = (evento.target as HTMLInputElement).value.trim().toLowerCase();
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.examenService.listar().subscribe({
      next: (datos) => {
        this.tabla.data = datos;
        this.cargando.set(false);
      },
      error: (error) => {
        this.cargando.set(false);
        this.toast.errorHttp(error, 'No se pudieron cargar los exámenes');
      },
    });
  }

  nuevo(): void {
    const referencia = this.dialogo.abrir<ExamenFormulario, Examen | null, Partial<Examen>>(ExamenFormulario);
    referencia.afterClosed().subscribe((resultado) => {
      if (!resultado) return;
      this.examenService.crear(resultado).subscribe({
        next: () => {
          this.toast.exito('Examen creado');
          this.cargar();
        },
        error: (error) => this.toast.errorHttp(error, 'No se pudo crear el examen'),
      });
    });
  }

  editar(examen: Examen): void {
    const referencia = this.dialogo.abrir<ExamenFormulario, Examen, Partial<Examen>>(ExamenFormulario, {
      data: examen,
    });
    referencia.afterClosed().subscribe((resultado) => {
      if (!resultado) return;
      this.examenService.actualizar(examen.id, resultado).subscribe({
        next: () => {
          this.toast.exito('Examen actualizado');
          this.cargar();
        },
        error: (error) => this.toast.errorHttp(error, 'No se pudo actualizar el examen'),
      });
    });
  }

  eliminar(examen: Examen): void {
    const referencia = this.dialogo.abrir<ConfirmarDialogo, unknown, boolean>(ConfirmarDialogo, {
      data: { titulo: 'Eliminar examen', mensaje: `¿Eliminar "${examen.nombre}"?` },
    });
    referencia.afterClosed().subscribe((confirmado) => {
      if (!confirmado) return;
      this.examenService.eliminar(examen.id).subscribe(() => {
        this.toast.exito('Examen eliminado');
        this.cargar();
      });
    });
  }
}
