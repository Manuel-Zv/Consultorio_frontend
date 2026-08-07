import { Especialidad } from './especialidad.model';

export interface Medico {
  id: number;
  numero_identificacion: string;
  nombres: string;
  apellidos: string;
  correo_electronico: string;
  telefono?: string;
  numero_licencia: string;
  especialidad_id: number;
  especialidad?: Especialidad;
  estado?: boolean;
}
