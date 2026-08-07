import { Component, OnInit, inject, signal } from '@angular/core';
import { TablaDatos } from '../../compartido/utilidades/tabla-datos';
import { Paginador } from '../../compartido/componentes/paginador';
import { DialogoService } from '../../compartido/servicios/dialogo.service';
import { ToastService } from '../../compartido/servicios/toast.service';
import { MedicamentoService } from '../../nucleo/servicios/medicamento.service';
import { Medicamento } from '../../nucleo/modelos/medicamento.model';
import { MedicamentoFormulario } from './medicamento-formulario';
import { ConfirmarDialogo } from '../../compartido/componentes/confirmar-dialogo';
import { AutenticacionService } from '../../nucleo/servicios/autenticacion.service';

@Component({
  selector: 'app-medicamentos-lista',
  standalone: true,
  imports: [Paginador],
  templateUrl: './medicamentos-lista.html',
})
export class MedicamentosLista implements OnInit {
  protected autenticacionService = inject(AutenticacionService);
  readonly tabla = new TablaDatos<Medicamento>([]);
  readonly cargando = signal(false);

  constructor(
    private medicamentoService: MedicamentoService,
    private dialogo: DialogoService,
    private toast: ToastService
  ) {
    this.tabla.filterPredicate = (item, filtro) =>
      `${item.codigo} ${item.nombre} ${item.presentacion ?? ''} ${item.concentracion ?? ''}`
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
    this.medicamentoService.listar().subscribe({
      next: (datos) => {
        this.tabla.data = datos;
        this.cargando.set(false);
      },
      error: (error) => {
        this.cargando.set(false);
        this.toast.errorHttp(error, 'No se pudieron cargar los medicamentos');
      },
    });
  }

  nuevo(): void {
    const referencia = this.dialogo.abrir<MedicamentoFormulario, Medicamento | null, Partial<Medicamento>>(
      MedicamentoFormulario
    );
    referencia.afterClosed().subscribe((resultado) => {
      if (!resultado) return;
      this.medicamentoService.crear(resultado).subscribe({
        next: () => {
          this.toast.exito('Medicamento creado');
          this.cargar();
        },
        error: (error) => this.toast.errorHttp(error, 'No se pudo crear el medicamento'),
      });
    });
  }

  editar(medicamento: Medicamento): void {
    const referencia = this.dialogo.abrir<MedicamentoFormulario, Medicamento, Partial<Medicamento>>(
      MedicamentoFormulario,
      { data: medicamento }
    );
    referencia.afterClosed().subscribe((resultado) => {
      if (!resultado) return;
      this.medicamentoService.actualizar(medicamento.id, resultado).subscribe({
        next: () => {
          this.toast.exito('Medicamento actualizado');
          this.cargar();
        },
        error: (error) => this.toast.errorHttp(error, 'No se pudo actualizar el medicamento'),
      });
    });
  }

  eliminar(medicamento: Medicamento): void {
    const referencia = this.dialogo.abrir<ConfirmarDialogo, unknown, boolean>(ConfirmarDialogo, {
      data: { titulo: 'Eliminar medicamento', mensaje: `¿Eliminar "${medicamento.nombre}"?` },
    });
    referencia.afterClosed().subscribe((confirmado) => {
      if (!confirmado) return;
      this.medicamentoService.eliminar(medicamento.id).subscribe(() => {
        this.toast.exito('Medicamento eliminado');
        this.cargar();
      });
    });
  }
}
