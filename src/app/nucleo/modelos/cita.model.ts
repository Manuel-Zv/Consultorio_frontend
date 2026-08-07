import { Paciente } from './paciente.model';
import { Medico } from './medico.model';
import { Consulta } from './consulta.model';

export type ModalidadCita = 'presencial' | 'virtual';
export type EstadoCita =
  | 'solicitada'
  | 'confirmada'
  | 'atendida'
  | 'cancelada'
  | 'no_asistida';

export interface Cita {
  id: number;
  paciente_id: number;
  medico_id: number;
  fecha_solicitud: string;
  fecha_hora_atencion: string;
  modalidad: ModalidadCita;
  motivo_consulta: string;
  estado: EstadoCita;
  paciente?: Paciente;
  medico?: Medico;
  consulta?: Consulta;
}
