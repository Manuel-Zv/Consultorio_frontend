import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { filter, map, mergeMap } from 'rxjs';
import { DialogoHost } from './compartido/componentes/dialogo-host';
import { ToastHost } from './compartido/componentes/toast-host';

const NOMBRE_CLINICA = 'Clínica Universitaria ESPAM MFL';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DialogoHost, ToastHost],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private titleService = inject(Title);

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd),
        map(() => {
          let ruta = this.activatedRoute;
          while (ruta.firstChild) ruta = ruta.firstChild;
          return ruta;
        }),
        mergeMap((ruta) => ruta.data)
      )
      .subscribe((data) => {
        const titulo = data['title'] ? `${data['title']} · ${NOMBRE_CLINICA}` : NOMBRE_CLINICA;
        this.titleService.setTitle(titulo);
      });
  }
}
