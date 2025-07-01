import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  constructor(private commonService: CommonService) { }

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
        this.sales = [];
        this.filteredSales = [];
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
}