import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ToastService } from '../../compartido/servicios/toast.service';
import { CitaService } from '../../nucleo/servicios/cita.service';
import { ConsultaService } from '../../nucleo/servicios/consulta.service';
import { Cita } from '../../nucleo/modelos/cita.model';

@Component({
  selector: 'app-consulta-nueva',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, RouterLink],
  templateUrl: './consulta-nueva.html',
})
export class ConsultaNueva implements OnInit {
  readonly cita = signal<Cita | null>(null);
  readonly citaId = signal<number | null>(null);
  readonly guardando = signal(false);

  readonly formulario = inject(FormBuilder).nonNullable.group({
    diagnostico: ['', Validators.required],
    sintomas: [''],
    observaciones: [''],
    recomendaciones: [''],
  });

  constructor(
    private ruta: ActivatedRoute,
    private router: Router,
    private citaService: CitaService,
    private consultaService: ConsultaService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const citaId = Number(this.ruta.snapshot.queryParamMap.get('cita_id'));
    if (!citaId) {
      this.toast.error('No se especificó la cita para la consulta');
      this.router.navigate(['/panel/citas']);
      return;
    }
    this.citaId.set(citaId);
    this.citaService.obtener(citaId).subscribe((cita) => this.cita.set(cita));
  }

  guardar(): void {
    if (this.formulario.invalid || !this.citaId()) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.consultaService.crear({ cita_id: this.citaId()!, ...this.formulario.getRawValue() }).subscribe({
      next: ({ consulta }) => {
        this.guardando.set(false);
        this.toast.exito('Consulta registrada');
        this.router.navigate(['/panel/consultas', consulta.id]);
      },
      error: (error) => {
        this.guardando.set(false);
        this.toast.errorHttp(error, 'No se pudo registrar la consulta');
      },
    });
  }
}
