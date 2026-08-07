import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EstadoExamenSolicitado, ExamenSolicitado } from '../modelos/examen-solicitado.model';

@Injectable({ providedIn: 'root' })
export class ExamenSolicitadoService {
  private readonly url = `${environment.apiUrl}/examenes-solicitados`;

  constructor(private http: HttpClient) {}

  listarPorConsulta(consultaId: number): Observable<ExamenSolicitado[]> {
    return this.http.get<ExamenSolicitado[]>(`${this.url}?consulta_id=${consultaId}`);
  }

  crear(solicitud: Partial<ExamenSolicitado>): Observable<{ solicitud: ExamenSolicitado }> {
    return this.http.post<{ solicitud: ExamenSolicitado }>(this.url, solicitud);
  }

  actualizar(
    id: number,
    solicitud: Partial<ExamenSolicitado> & { estado?: EstadoExamenSolicitado }
  ): Observable<{ solicitud: ExamenSolicitado }> {
    return this.http.put<{ solicitud: ExamenSolicitado }>(`${this.url}/${id}`, solicitud);
  }

  eliminar(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.url}/${id}`);
  }
}
