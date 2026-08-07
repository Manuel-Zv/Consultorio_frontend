import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RespuestaLogin, Usuario } from '../modelos/usuario.model';

const CLAVE_TOKEN = 'sm_token';
const CLAVE_USUARIO = 'sm_usuario';

@Injectable({ providedIn: 'root' })
export class AutenticacionService {
  private readonly usuarioSignal = signal<Usuario | null>(this.leerUsuarioGuardado());
  readonly usuario = computed(() => this.usuarioSignal());
  readonly estaAutenticado = computed(() => !!this.usuarioSignal());

  // Helpers de rol: centralizan aquí el nombre exacto del rol para no repetir
  // strings mágicos ('administrador'/'medico'/'paciente') por todo el frontend.
  readonly esAdministrador = computed(() => this.usuarioSignal()?.rol === 'administrador');
  readonly esMedico = computed(() => this.usuarioSignal()?.rol === 'medico');
  readonly esPaciente = computed(() => this.usuarioSignal()?.rol === 'paciente');

  constructor(private http: HttpClient) {}

  iniciarSesion(email: string, password: string): Observable<RespuestaLogin> {
    return this.http
      .post<RespuestaLogin>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((respuesta) => {
          localStorage.setItem(CLAVE_TOKEN, respuesta.token);
          localStorage.setItem(CLAVE_USUARIO, JSON.stringify(respuesta.usuario));
          this.usuarioSignal.set(respuesta.usuario);
        })
      );
  }

  cerrarSesion(): void {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_USUARIO);
    this.usuarioSignal.set(null);
  }

  obtenerToken(): string | null {
    return localStorage.getItem(CLAVE_TOKEN);
  }

  private leerUsuarioGuardado(): Usuario | null {
    const guardado = localStorage.getItem(CLAVE_USUARIO);
    return guardado ? (JSON.parse(guardado) as Usuario) : null;
  }
}
