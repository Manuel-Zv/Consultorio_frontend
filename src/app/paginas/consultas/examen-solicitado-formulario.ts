import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DIALOGO_DATOS, DialogoRef } from '../../compartido/servicios/dialogo.service';
import { Examen } from '../../nucleo/modelos/examen.model';
import { ExamenService } from '../../nucleo/servicios/examen.service';
import { ExamenSolicitado } from '../../nucleo/modelos/examen-solicitado.model';

@Component({
  selector: 'app-examen-solicitado-formulario',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './examen-solicitado-formulario.html',
})
export class ExamenSolicitadoFormulario implements OnInit {
  private referencia = inject(DialogoRef<Partial<ExamenSolicitado>>);
  protected datos: { consultaId: number } = inject(DIALOGO_DATOS) as { consultaId: number };
  private examenService = inject(ExamenService);

  readonly examenes = signal<Examen[]>([]);

  readonly formulario = inject(FormBuilder).group({
    examen_id: [null as number | null, Validators.required],
  });

  ngOnInit(): void {
    this.examenService.listar().subscribe((datos) => this.examenes.set(datos));
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
    } as unknown as Partial<ExamenSolicitado>);
  }
}
