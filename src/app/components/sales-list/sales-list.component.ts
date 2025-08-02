import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataTableComponent, DataTableColumn } from '../data-table/data-table.component';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-sales-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
  templateUrl: './sales-list.component.html',
  styleUrls: ['./sales-list.component.scss']
})
export class SalesListComponent implements OnInit {
  searchText: string = '';
  sales: any[] = [];
  filteredSales: any[] = [];
  columns: DataTableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'comprobante', label: 'Comprobante' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'moneda', label: 'Moneda' },
    { key: 'total', label: 'Total' }
  ];

  constructor(
    private commonService: CommonService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadSales();
  }

  loadSales() {
    this.commonService.getSalesList().subscribe({
      next: (data) => {
        this.sales = data;
        this.filteredSales = [...data];
      },
      error: (error) => {
        console.error('Error loading sales:', error);
        // Load test data when API fails
        this.sales = [
          {
            id: 1,
            comprobante: 'FAC-A-00001234',
            fecha: '2024-01-15',
            moneda: 'ARS',
            total: 785000.00
          },
          {
            id: 2,
            comprobante: 'FAC-B-00001235',
            fecha: '2024-01-16',
            moneda: 'ARS',
            total: 465000.00
          },
          {
            id: 3,
            comprobante: 'FAC-A-00001236',
            fecha: '2024-01-17',
            moneda: 'USD',
            total: 1250.00
          }
        ];
        this.filteredSales = [...this.sales];
      }
    });
  }

  onSearch() {
    if (!this.searchText.trim()) {
      this.filteredSales = [...this.sales];
      return;
    }

    const searchLower = this.searchText.toLowerCase();
    this.filteredSales = this.sales.filter(sale =>
      Object.values(sale).some(value =>
        String(value).toLowerCase().includes(searchLower)
      )
    );
  }

  onClearSearch() {
    this.searchText = '';
    this.filteredSales = [...this.sales];
  }

  volverAlDashboard() {
    this.router.navigate(['/dashboard']);
  }
}