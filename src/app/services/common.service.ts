import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(private http: HttpClient) { }

  getProductsList(): Observable<any[]> {
    return this.http.get<any[]>('/api/products');
  }

  getSalesList(): Observable<any[]> {
    return this.http.get<any[]>('/api/sales');
  }

  getStockMovements(): Observable<any[]> {
    return this.http.get<any[]>('/api/stock-movements');
  }

  getDashboardData(): Observable<any> {
    return this.http.get<any>('/api/dashboard');
  }
}