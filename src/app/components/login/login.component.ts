import { CommonModule } from '@angular/common';
import { AuthService } from './../../services/authService';
import { Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent {
  data = {
    rut: '',
    email: '',
    password: ''
  };

  error: string | null = null;
  rutInvalido = false;
  submitted = false;

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    this.submitted = true;
    this.validarRUT();

    if (this.rutInvalido) return;

    this.error = null;
    this.authService.login(this.data).subscribe({
      next: (response) => {
        // TODO: Redirigir
      },
      error: (err) => {
        this.error = typeof err === 'string' ? err : 'Error al iniciar sesión';
      }
    });
  }

  validarRUT(): void {
    const rut = this.data.rut.replace(/[^\dkK]/g, '').toUpperCase();
    if (!/^\d{7,8}[0-9K]$/.test(rut)) {
      this.rutInvalido = true;
      return;
    }

    const cuerpo = rut.slice(0, -1);
    const verificador = rut.slice(-1);
    let suma = 0;
    let multiplicador = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += +cuerpo[i] * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const digito = 11 - (suma % 11);
    const dv = digito === 11 ? '0' : digito === 10 ? 'K' : String(digito);
    this.rutInvalido = dv !== verificador;
  }
}

