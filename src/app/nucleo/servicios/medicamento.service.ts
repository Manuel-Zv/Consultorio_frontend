import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Medicamento } from '../modelos/medicamento.model';

@Injectable({ providedIn: 'root' })
export class MedicamentoService {
  private readonly url = `${environment.apiUrl}/medicamentos`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Medicamento[]> {
    return this.http.get<Medicamento[]>(this.url);
  }

  obtener(id: number): Observable<Medicamento> {
    return this.http.get<Medicamento>(`${this.url}/${id}`);
  }

  crear(medicamento: Partial<Medicamento>): Observable<{ medicamento: Medicamento }> {
    return this.http.post<{ medicamento: Medicamento }>(this.url, medicamento);
  }

  actualizar(id: number, medicamento: Partial<Medicamento>): Observable<{ medicamento: Medicamento }> {
    return this.http.put<{ medicamento: Medicamento }>(`${this.url}/${id}`, medicamento);
  }

  eliminar(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.url}/${id}`);
  }
}
