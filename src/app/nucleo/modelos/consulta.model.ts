import { Cita } from './cita.model';
import { DetalleReceta } from './detalle-receta.model';
import { ExamenSolicitado } from './examen-solicitado.model';

export interface Consulta {
  id: number;
  cita_id: number;
  diagnostico: string;
  sintomas?: string;
  observaciones?: string;
  recomendaciones?: string;
  fecha_atencion: string;
  cita?: Cita;
  detalle_recetas?: DetalleReceta[];
  examenes_solicitados?: ExamenSolicitado[];
}
