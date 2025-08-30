import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/authService';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ConfirmEmailComponent implements OnInit {
  message: string | null = null;
  isError: boolean = false;
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.confirmEmail(token);
      } else {
        this.isLoading = false;
        this.isError = true;
        this.message = 'Token no proporcionado';
      }
    });
  }

  confirmEmail(token: string): void {
    this.authService.confirmEmail(token).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.isError = false;
        this.message = 'Email confirmado.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.isLoading = false;
        this.isError = true;
        this.message = typeof err === 'string' ? err : 'Error al confirmar email';
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}