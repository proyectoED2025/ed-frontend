import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DataTableColumn {
  key: string;
  label: string;
}

export interface DataTableButton {
  id: string;
  label: string;
  class?: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements OnInit {
  @Input() columns: DataTableColumn[] = [];
  @Input() data: any[] = [];
  @Input() filters: string | object = '';
  @Input() buttons: DataTableButton[] = [];

  @Output() buttonClick = new EventEmitter<{ buttonId: string, row: any, index: number }>();

  filteredData: any[] = [];

  ngOnInit() {
    this.applyFilters();
  }

  ngOnChanges() {
    this.applyFilters();
  }

  private applyFilters() {
    if (!this.filters || this.filters === '') {
      this.filteredData = [...this.data];
      return;
    }

    if (typeof this.filters === 'string') {
      const filterText = this.filters.toLowerCase();
      this.filteredData = this.data.filter(row =>
        this.columns.some(col =>
          String(row[col.key]).toLowerCase().includes(filterText)
        )
      );
    } else {
      this.filteredData = this.data.filter(row => {
        return Object.keys(this.filters as object).every(key =>
          String(row[key]).toLowerCase().includes(String((this.filters as any)[key]).toLowerCase())
        );
      });
    }
  }

  onButtonClick(buttonId: string, row: any, index: number) {
    this.buttonClick.emit({ buttonId, row, index });
  }

  getCellValue(row: any, key: string): string {
    return row[key] ?? '';
  }
}