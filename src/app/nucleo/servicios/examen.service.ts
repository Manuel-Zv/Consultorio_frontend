import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Examen } from '../modelos/examen.model';

@Injectable({ providedIn: 'root' })
export class ExamenService {
  private readonly url = `${environment.apiUrl}/examenes`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Examen[]> {
    return this.http.get<Examen[]>(this.url);
  }

  obtener(id: number): Observable<Examen> {
    return this.http.get<Examen>(`${this.url}/${id}`);
  }

  crear(examen: Partial<Examen>): Observable<{ examen: Examen }> {
    return this.http.post<{ examen: Examen }>(this.url, examen);
  }

  actualizar(id: number, examen: Partial<Examen>): Observable<{ examen: Examen }> {
    return this.http.put<{ examen: Examen }>(`${this.url}/${id}`, examen);
  }

  eliminar(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.url}/${id}`);
  }
}
