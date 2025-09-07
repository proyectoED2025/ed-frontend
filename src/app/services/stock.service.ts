import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { buildApiUrl } from '../core/api-url';
import { API_ROUTES } from '../core/api-routes';

export interface StockMovementDto {
  codeSupply: string;
  quantityChange: number;
  movementType: string;
  movementDate?: string;
}

export interface StockMovementListItem {
  id: number;
  fecha: string;
  sku: string;
  tipo: string;
  cantidad: number;
  antes: number;
  despues: number;
  warehouse: string;
  usuario: string;
  documento: string;
  observacion?: string;
}

export interface PagedResult<T> {
  total: number;
  page: number;
  pageSize: number;
  items: T[];
}

@Injectable({
  providedIn: 'root'
})
export class StockService {

  constructor(private http: HttpClient) { }

  getMovements(): Observable<StockMovementDto[]> {
    return this.http.get<StockMovementDto[]>(buildApiUrl(API_ROUTES.VER_MOVIMIENTOS_STOCK));
  }

  getStockMovements(params: {
    page: number;
    pageSize: number;
    sku?: string;
    type?: string;
    from?: string;
    to?: string;
    sortBy?: string;
    sortDir?: string;
  }): Observable<PagedResult<StockMovementListItem>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.sku) {
      httpParams = httpParams.set('sku', params.sku);
    }
    if (params.type) {
      httpParams = httpParams.set('type', params.type);
    }
    if (params.from) {
      httpParams = httpParams.set('from', params.from);
    }
    if (params.to) {
      httpParams = httpParams.set('to', params.to);
    }
    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.sortDir) {
      httpParams = httpParams.set('sortDir', params.sortDir);
    }

    return this.http.get<PagedResult<StockMovementListItem>>(buildApiUrl(API_ROUTES.STOCK.MOVEMENTS), { params: httpParams });
  }
}
