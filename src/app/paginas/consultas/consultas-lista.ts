import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TablaDatos } from '../../compartido/utilidades/tabla-datos';
import { Paginador } from '../../compartido/componentes/paginador';
import { ConsultaService } from '../../nucleo/servicios/consulta.service';
import { ToastService } from '../../compartido/servicios/toast.service';
import { Consulta } from '../../nucleo/modelos/consulta.model';

@Component({
  selector: 'app-consultas-lista',
  standalone: true,
  imports: [DatePipe, RouterLink, Paginador],
  templateUrl: './consultas-lista.html',
})
export class ConsultasLista implements OnInit {
  readonly tabla = new TablaDatos<Consulta>([]);
  readonly cargando = signal(false);

  constructor(
    private consultaService: ConsultaService,
    private router: Router,
    private toast: ToastService
  ) {
    this.tabla.filterPredicate = (item, filtro) =>
      `${item.cita?.paciente?.nombres ?? ''} ${item.cita?.paciente?.apellidos ?? ''} ${item.cita?.medico?.nombres ?? ''} ${item.cita?.medico?.apellidos ?? ''} ${item.diagnostico}`
        .toLowerCase()
        .includes(filtro);
  }

  aplicarFiltro(evento: Event): void {
    this.tabla.filter = (evento.target as HTMLInputElement).value.trim().toLowerCase();
  }

  ngOnInit(): void {
    this.cargando.set(true);
    this.consultaService.listar().subscribe({
      next: (datos) => {
        this.tabla.data = datos;
        this.cargando.set(false);
      },
      error: (error) => {
        this.cargando.set(false);
        this.toast.errorHttp(error, 'No se pudieron cargar las consultas');
      },
    });
  }

  verDetalle(consulta: Consulta): void {
    this.router.navigate(['/panel/consultas', consulta.id]);
  }
}
