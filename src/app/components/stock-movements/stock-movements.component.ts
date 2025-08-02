import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataTableComponent, DataTableColumn } from '../data-table/data-table.component';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-stock-movements',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
  templateUrl: './stock-movements.component.html',
  styleUrls: ['./stock-movements.component.scss']
})
export class StockMovementsComponent implements OnInit {
  searchText: string = '';
  stockMovements: any[] = [];
  filteredStockMovements: any[] = [];
  columns: DataTableColumn[] = [
    { key: 'id', label: 'ID de Movimiento' },
    { key: 'cantidad', label: 'Cantidad' },
    { key: 'comprobante', label: 'Comprobante' },
    { key: 'fecha', label: 'Fecha' }
  ];

  constructor(
    private commonService: CommonService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadStockMovements();
  }

  loadStockMovements() {
    this.commonService.getStockMovements().subscribe({
      next: (data) => {
        this.stockMovements = data;
        this.filteredStockMovements = [...data];
      },
      error: (error) => {
        console.error('Error loading stock movements:', error);
        // Load test data when API fails
        this.stockMovements = [
          {
            id: 'MOV-001',
            cantidad: 15,
            comprobante: 'ING-00001234',
            fecha: '2024-01-15'
          },
          {
            id: 'MOV-002',
            cantidad: -8,
            comprobante: 'EGR-00001235',
            fecha: '2024-01-16'
          },
          {
            id: 'MOV-003',
            cantidad: 25,
            comprobante: 'ING-00001236',
            fecha: '2024-01-17'
          }
        ];
        this.filteredStockMovements = [...this.stockMovements];
      }
    });
  }

  onSearch() {
    if (!this.searchText.trim()) {
      this.filteredStockMovements = [...this.stockMovements];
      return;
    }

    const searchLower = this.searchText.toLowerCase();
    this.filteredStockMovements = this.stockMovements.filter(movement =>
      Object.values(movement).some(value =>
        String(value).toLowerCase().includes(searchLower)
      )
    );
  }

  onClearSearch() {
    this.searchText = '';
    this.filteredStockMovements = [...this.stockMovements];
  }

  volverAlDashboard() {
    this.router.navigate(['/dashboard']);
  }
}