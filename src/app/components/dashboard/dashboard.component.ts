import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { AuthService } from '../../services/authService';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  dashboardData: any = {
    contactos: 0,
    productos: 0,
    insumos: 0
  };
  currentUser: string = '';
  currentCompany: string = '';
  currentDate: Date = new Date();
  isLoading: boolean = true;

  constructor(
    private commonService: CommonService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.loadUserData();
    this.loadDashboardData();
  }

  loadUserData() {
    // Suscribirse al usuario actual en memoria
    this.authService.currentUser$.subscribe({
      next: (user: any) => {
        console.log('Usuario recibido en dashboard:', user);
        this.currentUser = user?.name || 'Usuario';
      }
    });

    // Obtener usuario inmediatamente desde memoria si está disponible
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      console.log('Usuario inmediato desde memoria:', currentUser);
      this.currentUser = currentUser.name;
    }

    // Mantener el company por compatibilidad
    this.authService.getCurrentCompany().subscribe({
      next: (company: any) => {
        this.currentCompany = company?.name || 'Stock Manager';
      },
      error: (error: any) => {
        console.error('Error loading company data:', error);
        this.currentCompany = 'Stock Manager';
      }
    });
  }

  loadDashboardData() {
    this.commonService.getDashboardData().subscribe({
      next: (data: any) => {
        this.dashboardData = {
          contactos: data.contactos || 0,
          productos: data.productos || 0,
          insumos: data.insumos || 0
        };
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading dashboard data:', error);
        // Load test data when API fails
        this.dashboardData = {
          contactos: 0,
          productos: 0,
          insumos: 0
        };
        this.isLoading = false;
      }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(value);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('es-AR').format(value);
  }

  logout() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
      this.authService.logout();
    }
  }
}