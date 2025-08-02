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
    importeVendido: 0,
    productosEnStock: 0,
    valorizacionStock: 0
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
    this.authService.getCurrentUser().subscribe({
      next: (user: any) => {
        this.currentUser = user?.name || 'Usuario';
      },
      error: (error: any) => {
        console.error('Error loading user data:', error);
        this.currentUser = 'Usuario';
      }
    });

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
          importeVendido: data.importeVendido || 0,
          productosEnStock: data.productosEnStock || 0,
          valorizacionStock: data.valorizacionStock || 0
        };
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading dashboard data:', error);
        // Load test data when API fails
        this.dashboardData = {
          importeVendido: 2485750.50,
          productosEnStock: 247,
          valorizacionStock: 1825430.75
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
}