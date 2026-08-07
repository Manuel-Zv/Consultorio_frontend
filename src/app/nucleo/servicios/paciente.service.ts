import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Paciente } from '../modelos/paciente.model';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private readonly url = `${environment.apiUrl}/pacientes`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(this.url);
  }

  obtener(id: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.url}/${id}`);
  }

  crear(paciente: Partial<Paciente>): Observable<{ paciente: Paciente }> {
    return this.http.post<{ paciente: Paciente }>(this.url, paciente);
  }

  actualizar(id: number, paciente: Partial<Paciente>): Observable<{ paciente: Paciente }> {
    return this.http.put<{ paciente: Paciente }>(`${this.url}/${id}`, paciente);
  }

  eliminar(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.url}/${id}`);
  }
}
