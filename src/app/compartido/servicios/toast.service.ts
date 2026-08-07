import { Injectable, signal } from '@angular/core';

export type TipoToast = 'exito' | 'error' | 'info';

export interface Toast {
  id: number;
  mensaje: string;
  tipo: TipoToast;
}

let contador = 0;

/** Reemplazo minimalista de MatSnackBar: una pila de notificaciones que se autodescartan. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  mostrar(mensaje: string, tipo: TipoToast = 'info', duracionMs = 4000): void {
    const id = ++contador;
    this._toasts.update((lista) => [...lista, { id, mensaje, tipo }]);
    setTimeout(() => this.descartar(id), duracionMs);
  }

  exito(mensaje: string, duracionMs = 3000): void {
    this.mostrar(mensaje, 'exito', duracionMs);
  }

  error(mensaje: string, duracionMs = 6000): void {
    this.mostrar(mensaje, 'error', duracionMs);
  }

  /** Extrae el mensaje de un error HTTP de Angular y lo muestra, con un texto por defecto. */
  errorHttp(error: unknown, mensajePorDefecto: string): void {
    const cuerpo = (error as { error?: { message?: string; error?: string } })?.error;
    this.error(cuerpo?.message ?? cuerpo?.error ?? mensajePorDefecto);
  }

  descartar(id: number): void {
    this._toasts.update((lista) => lista.filter((t) => t.id !== id));
  }
}
