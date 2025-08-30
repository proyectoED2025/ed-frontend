import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/authService';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  encapsulation: ViewEncapsulation.None
})
export class RegisterComponent {
  data = {
    name: '',
    userEmail: '',
    userName: '',
    phoneNumber: '',
    password: ''
  };

  error: string | null = null;
  success: string | null = null;
  submitted = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.submitted = true;
    this.error = null;
    this.success = null;

    if (!this.isFormValid()) return;

    this.authService.register(this.data).subscribe({
      next: (response) => {
        this.success = 'Usuario registrado correctamente.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.error = typeof err === 'string' ? err : 'Error al registrar usuario';
      }
    });
  }

  isFormValid(): boolean {
    return !!(
      this.data.name &&
      this.data.userEmail &&
      this.data.userName &&
      this.data.phoneNumber &&
      this.data.password &&
      this.isEmailValid() &&
      this.isPasswordValid() &&
      this.isPhoneValid()
    );
  }

  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.data.userEmail);
  }

  isPasswordValid(): boolean {
    return this.data.password.length >= 6 && this.data.password.length <= 10;
  }

  isPhoneValid(): boolean {
    const phoneRegex = /^09\d{7}$/;
    return phoneRegex.test(this.data.phoneNumber);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
