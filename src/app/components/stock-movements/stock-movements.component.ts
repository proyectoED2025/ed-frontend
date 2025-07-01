import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  constructor(private commonService: CommonService) { }

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
        this.stockMovements = [];
        this.filteredStockMovements = [];
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
}