import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataTableComponent, DataTableColumn } from '../data-table/data-table.component';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss']
})
export class ProductsListComponent implements OnInit {
  searchText: string = '';
  products: any[] = [];
  filteredProducts: any[] = [];
  columns: DataTableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nombre' },
    { key: 'price', label: 'Precio' },
    { key: 'category', label: 'Categoría' },
    { key: 'stock', label: 'Stock' }
  ];

  constructor(
    private commonService: CommonService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.commonService.getProductsList().subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = [...data];
      },
      error: (error) => {
        console.error('Error loading products:', error);
        // Load test data when API fails
        this.products = [
          {
            id: 1,
            name: 'Notebook Dell Inspiron 15',
            price: 785000.00,
            category: 'Informática',
            stock: 12
          },
          {
            id: 2,
            name: 'Smartphone Samsung Galaxy A54',
            price: 320000.00,
            category: 'Telefonía',
            stock: 25
          },
          {
            id: 3,
            name: 'Auriculares Sony WH-1000XM4',
            price: 145000.00,
            category: 'Audio',
            stock: 8
          }
        ];
        this.filteredProducts = [...this.products];
      }
    });
  }

  onSearch() {
    if (!this.searchText.trim()) {
      this.filteredProducts = [...this.products];
      return;
    }

    const searchLower = this.searchText.toLowerCase();
    this.filteredProducts = this.products.filter(product =>
      Object.values(product).some(value =>
        String(value).toLowerCase().includes(searchLower)
      )
    );
  }

  onClearSearch() {
    this.searchText = '';
    this.filteredProducts = [...this.products];
  }

  volverAlDashboard() {
    this.router.navigate(['/dashboard']);
  }
}