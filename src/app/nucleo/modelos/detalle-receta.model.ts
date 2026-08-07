import { Medicamento } from './medicamento.model';

export interface DetalleReceta {
  id: number;
  consulta_id: number;
  medicamento_id: number;
  dosis: string;
  frecuencia: string;
  duracion_tratamiento: string;
  indicaciones?: string;
  medicamento?: Medicamento;
}
