import { Examen } from './examen.model';

export type EstadoExamenSolicitado =
  | 'solicitado'
  | 'realizado'
  | 'entregado'
  | 'cancelado';

export interface ExamenSolicitado {
  id: number;
  consulta_id: number;
  examen_id: number;
  fecha_solicitud: string;
  resultado?: string;
  fecha_resultado?: string;
  estado: EstadoExamenSolicitado;
  examen?: Examen;
}
