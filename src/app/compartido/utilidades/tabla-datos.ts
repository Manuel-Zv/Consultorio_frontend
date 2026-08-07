import { signal } from '@angular/core';

/** Lo mínimo que necesita `<app-paginador>` — así el componente no depende del tipo `T` de cada tabla. */
export interface PaginacionControlable {
  readonly pagina: () => number;
  readonly tamanioPagina: () => number;
  readonly totalPaginas: number;
  readonly filteredData: { length: number };
  primeraPagina(): void;
  paginaAnterior(): void;
  paginaSiguiente(): void;
  irAPagina(indice: number): void;
}

/**
 * Reemplazo minimalista de `MatTableDataSource` (sin @angular/material):
 * mismo vocabulario (`data`, `filter`, `filteredData`) para que los
 * componentes de lista casi no cambien, más paginación en memoria con
 * signals. No incluye orden por columna (mat-sort-header) — alcance
 * recortado a propósito por tiempo; los datos ya vienen ordenados del backend.
 */
export class TablaDatos<T> implements PaginacionControlable {
  /** Se evalúa contra el texto de búsqueda en minúsculas; cada lista define qué campos incluir. */
  filterPredicate: (item: T, filtro: string) => boolean = () => true;

  private _datos: T[] = [];
  private _filtro = '';

  readonly pagina = signal(0);
  readonly tamanioPagina = signal(10);

  constructor(datosIniciales: T[] = []) {
    this._datos = datosIniciales;
  }

  set data(valor: T[]) {
    this._datos = valor;
    this.pagina.set(0);
  }
  get data(): T[] {
    return this._datos;
  }

  set filter(valor: string) {
    this._filtro = valor;
    this.pagina.set(0);
  }
  get filter(): string {
    return this._filtro;
  }

  get filteredData(): T[] {
    if (!this._filtro) return this._datos;
    return this._datos.filter((item) => this.filterPredicate(item, this._filtro));
  }

  get paginatedData(): T[] {
    const inicio = this.pagina() * this.tamanioPagina();
    return this.filteredData.slice(inicio, inicio + this.tamanioPagina());
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.filteredData.length / this.tamanioPagina()));
  }

  primeraPagina(): void {
    this.pagina.set(0);
  }

  irAPagina(indice: number): void {
    this.pagina.set(Math.max(0, Math.min(indice, this.totalPaginas - 1)));
  }

  paginaSiguiente(): void {
    this.irAPagina(this.pagina() + 1);
  }

  paginaAnterior(): void {
    this.irAPagina(this.pagina() - 1);
  }

  cambiarTamanioPagina(tamanio: number): void {
    this.tamanioPagina.set(tamanio);
    this.pagina.set(0);
  }
}
