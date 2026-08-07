import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DetalleReceta } from '../modelos/detalle-receta.model';

@Injectable({ providedIn: 'root' })
export class DetalleRecetaService {
  private readonly url = `${environment.apiUrl}/detalle-recetas`;

  constructor(private http: HttpClient) {}

  listarPorConsulta(consultaId: number): Observable<DetalleReceta[]> {
    return this.http.get<DetalleReceta[]>(`${this.url}?consulta_id=${consultaId}`);
  }

  crear(detalle: Partial<DetalleReceta>): Observable<{ detalle: DetalleReceta }> {
    return this.http.post<{ detalle: DetalleReceta }>(this.url, detalle);
  }

  actualizar(id: number, detalle: Partial<DetalleReceta>): Observable<{ detalle: DetalleReceta }> {
    return this.http.put<{ detalle: DetalleReceta }>(`${this.url}/${id}`, detalle);
  }

  eliminar(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.url}/${id}`);
  }
}
