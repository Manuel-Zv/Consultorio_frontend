import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DIALOGO_DATOS, DialogoRef } from '../../compartido/servicios/dialogo.service';
import { Medicamento } from '../../nucleo/modelos/medicamento.model';
import { MedicamentoService } from '../../nucleo/servicios/medicamento.service';
import { DetalleReceta } from '../../nucleo/modelos/detalle-receta.model';

@Component({
  selector: 'app-detalle-receta-formulario',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './detalle-receta-formulario.html',
})
export class DetalleRecetaFormulario implements OnInit {
  private referencia = inject(DialogoRef<Partial<DetalleReceta>>);
  protected datos: { consultaId: number } = inject(DIALOGO_DATOS) as { consultaId: number };
  private medicamentoService = inject(MedicamentoService);

  readonly medicamentos = signal<Medicamento[]>([]);

  readonly formulario = inject(FormBuilder).group({
    medicamento_id: [null as number | null, Validators.required],
    dosis: ['', Validators.required],
    frecuencia: ['', Validators.required],
    duracion_tratamiento: ['', Validators.required],
    indicaciones: [''],
  });

  ngOnInit(): void {
    this.medicamentoService.listar().subscribe((datos) => this.medicamentos.set(datos));
  }

  cerrar(): void {
    this.referencia.close(undefined);
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.referencia.close({
      consulta_id: this.datos.consultaId,
      ...this.formulario.getRawValue(),
    } as unknown as Partial<DetalleReceta>);
  }
}
