export type RolUsuario = 'administrador' | 'medico' | 'paciente';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: RolUsuario;
  paciente_id?: number | null;
  medico_id?: number | null;
}

export interface RespuestaLogin {
  message: string;
  token: string;
  usuario: Usuario;
}
