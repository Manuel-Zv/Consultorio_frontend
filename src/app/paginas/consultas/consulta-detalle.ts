import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DialogoService } from '../../compartido/servicios/dialogo.service';
import { ToastService } from '../../compartido/servicios/toast.service';
import { ConsultaService } from '../../nucleo/servicios/consulta.service';
import { DetalleRecetaService } from '../../nucleo/servicios/detalle-receta.service';
import { ExamenSolicitadoService } from '../../nucleo/servicios/examen-solicitado.service';
import { Consulta } from '../../nucleo/modelos/consulta.model';
import { ExamenSolicitado } from '../../nucleo/modelos/examen-solicitado.model';
import { DetalleRecetaFormulario } from './detalle-receta-formulario';
import { ExamenSolicitadoFormulario } from './examen-solicitado-formulario';
import { ExamenSolicitadoEditar } from './examen-solicitado-editar';

type Pestana = 'diagnostico' | 'receta' | 'examenes';

@Component({
  selector: 'app-consulta-detalle',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './consulta-detalle.html',
})
export class ConsultaDetalle implements OnInit {
  readonly consulta = signal<Consulta | null>(null);
  readonly cargando = signal(false);
  readonly hoy = new Date();
  readonly pestanaActiva = signal<Pestana>('diagnostico');

  private consultaId!: number;

  constructor(
    private ruta: ActivatedRoute,
    private consultaService: ConsultaService,
    private detalleRecetaService: DetalleRecetaService,
    private examenSolicitadoService: ExamenSolicitadoService,
    private dialogo: DialogoService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.consultaId = Number(this.ruta.snapshot.paramMap.get('id'));
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.consultaService.obtener(this.consultaId).subscribe({
      next: (datos) => {
        this.consulta.set(datos);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  cambiarPestana(pestana: Pestana): void {
    this.pestanaActiva.set(pestana);
  }

  recetarMedicamento(): void {
    const referencia = this.dialogo.abrir<DetalleRecetaFormulario, { consultaId: number }, unknown>(
      DetalleRecetaFormulario,
      { data: { consultaId: this.consultaId } }
    );
    referencia.afterClosed().subscribe((resultado) => {
      if (!resultado) return;
      this.detalleRecetaService.crear(resultado).subscribe(() => {
        this.toast.exito('Medicamento recetado');
        this.cargar();
      });
    });
  }

  solicitarExamen(): void {
    const referencia = this.dialogo.abrir<ExamenSolicitadoFormulario, { consultaId: number }, unknown>(
      ExamenSolicitadoFormulario,
      { data: { consultaId: this.consultaId } }
    );
    referencia.afterClosed().subscribe((resultado) => {
      if (!resultado) return;
      this.examenSolicitadoService.crear(resultado).subscribe(() => {
        this.toast.exito('Examen solicitado');
        this.cargar();
      });
    });
  }

  editarExamenSolicitado(solicitud: ExamenSolicitado): void {
    const referencia = this.dialogo.abrir<ExamenSolicitadoEditar, ExamenSolicitado, unknown>(ExamenSolicitadoEditar, {
      data: solicitud,
    });
    referencia.afterClosed().subscribe((resultado) => {
      if (!resultado) return;
      this.examenSolicitadoService.actualizar(solicitud.id, resultado).subscribe(() => {
        this.toast.exito('Examen solicitado actualizado');
        this.cargar();
      });
    });
  }

  imprimir(): void {
    window.print();
  }

  colorEstado(estado: string): string {
    switch (estado) {
      case 'realizado':
        return 'estado-realizado';
      case 'entregado':
        return 'estado-entregado';
      case 'cancelado':
        return 'estado-cancelada';
      default:
        return 'estado-solicitada';
    }
  }
}
