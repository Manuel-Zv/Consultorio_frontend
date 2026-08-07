import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Medico } from '../modelos/medico.model';

@Injectable({ providedIn: 'root' })
export class MedicoService {
  private readonly url = `${environment.apiUrl}/medicos`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Medico[]> {
    return this.http.get<Medico[]>(this.url);
  }

  obtener(id: number): Observable<Medico> {
    return this.http.get<Medico>(`${this.url}/${id}`);
  }

  crear(medico: Partial<Medico>): Observable<{ medico: Medico }> {
    return this.http.post<{ medico: Medico }>(this.url, medico);
  }

  actualizar(id: number, medico: Partial<Medico>): Observable<{ medico: Medico }> {
    return this.http.put<{ medico: Medico }>(`${this.url}/${id}`, medico);
  }

  eliminar(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.url}/${id}`);
  }
}
