import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Consulta } from '../modelos/consulta.model';

@Injectable({ providedIn: 'root' })
export class ConsultaService {
  private readonly url = `${environment.apiUrl}/consultas`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Consulta[]> {
    return this.http.get<Consulta[]>(this.url);
  }

  obtener(id: number): Observable<Consulta> {
    return this.http.get<Consulta>(`${this.url}/${id}`);
  }

  crear(consulta: Partial<Consulta>): Observable<{ consulta: Consulta }> {
    return this.http.post<{ consulta: Consulta }>(this.url, consulta);
  }

  actualizar(id: number, consulta: Partial<Consulta>): Observable<{ consulta: Consulta }> {
    return this.http.put<{ consulta: Consulta }>(`${this.url}/${id}`, consulta);
  }

  eliminar(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.url}/${id}`);
  }
}
