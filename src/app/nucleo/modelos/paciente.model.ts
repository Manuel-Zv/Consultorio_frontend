export type TipoPaciente = 'estudiante' | 'docente' | 'administrativo';
export type Sexo = 'M' | 'F';

export interface Paciente {
  id: number;
  numero_identificacion: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  sexo: Sexo;
  correo_electronico: string;
  telefono?: string;
  direccion?: string;
  tipo_paciente: TipoPaciente;
  estado?: boolean;
}
