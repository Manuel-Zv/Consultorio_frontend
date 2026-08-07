import { Injectable, InjectionToken, Injector, Type, ViewContainerRef, signal } from '@angular/core';
import { Subject } from 'rxjs';

/** Token de inyección para pasar datos a un componente abierto como diálogo (reemplaza MAT_DIALOG_DATA). */
export const DIALOGO_DATOS = new InjectionToken<unknown>('DIALOGO_DATOS');

/** Referencia al diálogo abierto (reemplaza MatDialogRef): permite cerrarlo y suscribirse al resultado. */
export class DialogoRef<R = unknown> {
  private readonly _afterClosed = new Subject<R | undefined>();

  close(resultado?: R): void {
    this._afterClosed.next(resultado);
    this._afterClosed.complete();
  }

  afterClosed() {
    return this._afterClosed.asObservable();
  }
}

interface ConfigDialogo<D> {
  data?: D;
  ancho?: 'md' | 'lg';
}

/**
 * Reemplazo ligero de MatDialog usando `ViewContainerRef.createComponent`
 * (API nativa de Angular, sin depender de @angular/material). El contenedor
 * real vive en `DialogoHost`, montado una sola vez en `app.html`.
 */
@Injectable({ providedIn: 'root' })
export class DialogoService {
  private contenedor?: ViewContainerRef;
  readonly abierto = signal(false);
  readonly anchoActual = signal<'md' | 'lg'>('md');
  private cerrarActualFn?: () => void;

  registrarContenedor(vc: ViewContainerRef): void {
    this.contenedor = vc;
  }

  abrir<T, D = unknown, R = unknown>(componente: Type<T>, config?: ConfigDialogo<D>): DialogoRef<R> {
    if (!this.contenedor) {
      throw new Error('DialogoHost no está montado todavía.');
    }
    this.contenedor.clear();

    const dialogoRef = new DialogoRef<R>();
    const injector = Injector.create({
      parent: this.contenedor.injector,
      providers: [
        { provide: DIALOGO_DATOS, useValue: config?.data ?? null },
        { provide: DialogoRef, useValue: dialogoRef },
      ],
    });

    const compRef = this.contenedor.createComponent(componente, { injector });
    this.anchoActual.set(config?.ancho ?? 'md');
    this.abierto.set(true);

    const cerrar = () => {
      this.abierto.set(false);
      this.contenedor?.clear();
      this.cerrarActualFn = undefined;
    };
    this.cerrarActualFn = () => dialogoRef.close(undefined);

    dialogoRef.afterClosed().subscribe(() => {
      cerrar();
    });

    return dialogoRef;
  }

  /** Lo invoca DialogoHost al hacer click en el backdrop o presionar Escape. */
  cerrarActual(): void {
    this.cerrarActualFn?.();
  }
}
