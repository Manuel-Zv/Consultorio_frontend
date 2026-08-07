import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Especialidad } from '../modelos/especialidad.model';

@Injectable({ providedIn: 'root' })
export class EspecialidadService {
  private readonly url = `${environment.apiUrl}/especialidades`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Especialidad[]> {
    return this.http.get<Especialidad[]>(this.url);
  }

  obtener(id: number): Observable<Especialidad> {
    return this.http.get<Especialidad>(`${this.url}/${id}`);
  }

  crear(especialidad: Partial<Especialidad>): Observable<{ especialidad: Especialidad }> {
    return this.http.post<{ especialidad: Especialidad }>(this.url, especialidad);
  }

  actualizar(id: number, especialidad: Partial<Especialidad>): Observable<{ especialidad: Especialidad }> {
    return this.http.put<{ especialidad: Especialidad }>(`${this.url}/${id}`, especialidad);
  }

  eliminar(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.url}/${id}`);
  }
}
