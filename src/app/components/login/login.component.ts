import { CommonModule } from '@angular/common';
import { AuthService } from './../../services/authService';
import { Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent {
  data = {
    userName: '',
    password: ''
  };

  error: string | null = null;
  submitted = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.submitted = true;
    
    if (!this.data.userName || !this.data.password) return;

    this.error = null;
    this.authService.login(this.data).subscribe({
      next: (response) => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = typeof err === 'string' ? err : 'Error al iniciar sesión';
      }
    });
  }

}

