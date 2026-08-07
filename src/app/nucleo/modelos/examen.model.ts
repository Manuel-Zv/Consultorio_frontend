export interface Examen {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  costo: number;
  estado?: boolean;
}
