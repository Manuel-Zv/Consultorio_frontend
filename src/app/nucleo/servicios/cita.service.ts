import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cita, EstadoCita } from '../modelos/cita.model';

@Injectable({ providedIn: 'root' })
export class CitaService {
  private readonly url = `${environment.apiUrl}/citas`;

  constructor(private http: HttpClient) {}

  listar(filtros?: { estado?: EstadoCita; paciente_id?: number; medico_id?: number }): Observable<Cita[]> {
    const partes: string[] = [];
    if (filtros?.estado) partes.push(`estado=${filtros.estado}`);
    if (filtros?.paciente_id) partes.push(`paciente_id=${filtros.paciente_id}`);
    if (filtros?.medico_id) partes.push(`medico_id=${filtros.medico_id}`);
    const params = partes.length ? `?${partes.join('&')}` : '';
    return this.http.get<Cita[]>(`${this.url}${params}`);
  }

  obtener(id: number): Observable<Cita> {
    return this.http.get<Cita>(`${this.url}/${id}`);
  }

  crear(cita: Partial<Cita>): Observable<{ cita: Cita }> {
    return this.http.post<{ cita: Cita }>(this.url, cita);
  }

  actualizar(id: number, cita: Partial<Cita>): Observable<{ cita: Cita }> {
    return this.http.put<{ cita: Cita }>(`${this.url}/${id}`, cita);
  }

  cambiarEstado(id: number, estado: EstadoCita): Observable<{ cita: Cita }> {
    return this.http.patch<{ cita: Cita }>(`${this.url}/${id}/estado`, { estado });
  }

  eliminar(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.url}/${id}`);
  }
}
