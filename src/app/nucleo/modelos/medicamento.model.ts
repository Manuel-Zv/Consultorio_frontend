export interface Medicamento {
  id: number;
  codigo: string;
  nombre: string;
  presentacion?: string;
  concentracion?: string;
  descripcion?: string;
  estado?: boolean;
}
