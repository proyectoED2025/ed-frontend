import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataTableComponent, DataTableColumn } from '../data-table/data-table.component';
import { StockService, StockMovementDto } from '../../services/stock.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-stock-movements',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
  templateUrl: './stock-movements.component.html',
  styleUrls: ['./stock-movements.component.scss']
})
export class StockMovementsComponent implements OnInit, OnDestroy {
  allRows: StockMovementDto[] = [];
  filteredRows: StockMovementDto[] = [];
  rows: StockMovementDto[] = [];
  total: number = 0;
  page: number = 1;
  pageSize: number = 20;
  filters = {
    sku: '',
    type: '',
    from: null as string | null,
    to: null as string | null
  };
  loading: boolean = false;
  sortBy: 'movementDate' | 'codeSupply' | 'movementType' | 'quantityChange' = 'movementDate';
  sortDir: 'asc' | 'desc' = 'desc';
  
  private skuSearchSubject = new Subject<string>();

  columns: DataTableColumn[] = [
    { key: 'codeSupply', label: 'Código Insumo' },
    { key: 'quantityChange', label: 'Cantidad' },
    { key: 'movementType', label: 'Tipo de Movimiento' },
    { key: 'movementDate', label: 'Fecha de Movimiento' }
  ];

  movementTypes = [
    { value: '', label: 'Todos los tipos' },
    { value: 'Alta', label: 'Alta' },
    { value: 'Baja', label: 'Baja' },
    { value: 'Edición', label: 'Edición' }
  ];

  pageSizeOptions = [10, 20, 50, 100];

  constructor(
    private stockService: StockService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadMovements();
    
    this.skuSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.onFilter();
    });
  }
  
  ngOnDestroy() {
    this.skuSearchSubject.complete();
  }

  loadMovements() {
    this.loading = true;

    this.stockService.getMovements().subscribe({
      next: (data: StockMovementDto[]) => {
        this.allRows = data.map(item => ({
          ...item,
          movementDate: item.movementDate ? new Date(item.movementDate).toLocaleDateString() : ''
        }));
        this.applyFiltersAndPaging();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading stock movements:', error);
        this.allRows = [];
        this.rows = [];
        this.total = 0;
        this.loading = false;
      }
    });
  }

  applyFiltersAndPaging() {
    let filtered = [...this.allRows];

    if (this.filters.sku.trim()) {
      const skuLower = this.filters.sku.trim().toLowerCase();
      filtered = filtered.filter(item => 
        item.codeSupply.toLowerCase().includes(skuLower)
      );
    }

    if (this.filters.type) {
      filtered = filtered.filter(item => item.movementType === this.filters.type);
    }

    if (this.filters.from || this.filters.to) {
      filtered = filtered.filter(item => {
        if (!item.movementDate) return false;
        
        const itemDate = new Date(item.movementDate);
        let withinRange = true;

        if (this.filters.from) {
          const fromDate = new Date(this.filters.from);
          fromDate.setHours(0, 0, 0, 0);
          withinRange = withinRange && itemDate >= fromDate;
        }

        if (this.filters.to) {
          const toDate = new Date(this.filters.to);
          toDate.setHours(23, 59, 59, 999);
          withinRange = withinRange && itemDate <= toDate;
        }

        return withinRange;
      });
    }

    filtered.sort((a, b) => {
      let aValue: any = a[this.sortBy];
      let bValue: any = b[this.sortBy];

      if (this.sortBy === 'movementDate') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      } else if (this.sortBy === 'quantityChange') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (aValue < bValue) return this.sortDir === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredRows = filtered;
    this.total = filtered.length;

    const totalPages = Math.ceil(this.total / this.pageSize);
    if (this.page > totalPages && totalPages > 0) {
      this.page = totalPages;
    }

    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.rows = filtered.slice(startIndex, endIndex);
  }

  onFilter() {
    this.page = 1;
    this.applyFiltersAndPaging();
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.applyFiltersAndPaging();
  }

  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.page = 1;
    this.applyFiltersAndPaging();
  }

  onClearFilters() {
    this.filters = {
      sku: '',
      type: '',
      from: null,
      to: null
    };
    this.page = 1;
    this.applyFiltersAndPaging();
  }

  onSkuChange() {
    this.skuSearchSubject.next(this.filters.sku);
  }

  onRefresh() {
    this.loadMovements();
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  get startRecord(): number {
    return ((this.page - 1) * this.pageSize) + 1;
  }

  get endRecord(): number {
    return Math.min(this.page * this.pageSize, this.total);
  }

  volverAlDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
