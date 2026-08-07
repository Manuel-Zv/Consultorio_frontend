import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AutenticacionService } from '../../nucleo/servicios/autenticacion.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  readonly cargando = signal(false);
  readonly errorMensaje = signal('');
  readonly ocultarPassword = signal(true);

  readonly formulario = new FormBuilder().group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  constructor(
    private autenticacionService: AutenticacionService,
    private router: Router
  ) {}

  alternarPassword(): void {
    this.ocultarPassword.set(!this.ocultarPassword());
  }

  iniciarSesion(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const { email, password } = this.formulario.getRawValue();
    this.cargando.set(true);
    this.errorMensaje.set('');

    this.autenticacionService.iniciarSesion(email!, password!).subscribe({
      next: () => {
        this.cargando.set(false);
        this.router.navigate(['/panel']);
      },
      error: (error) => {
        this.cargando.set(false);
        this.errorMensaje.set(error.error?.message ?? 'No se pudo iniciar sesión');
      },
    });
  }
}
