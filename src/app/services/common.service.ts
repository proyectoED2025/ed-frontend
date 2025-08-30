import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './authService';
import { Product, ProductDto, UpdateDescriptionProductDto, UpdateImageProductDto, Supply, ProductMovement } from '../models/product.interfaces';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(private http: HttpClient, private authService: AuthService) { }

  private withAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido';
    
    if (error.status === 400 || error.status === 404) {
      errorMessage = error.error?.message || error.error?.mensaje || 'Datos inválidos';
    } else if (error.status === 401 || error.status === 403) {
      errorMessage = 'No autorizado. Verifique su sesión.';
    } else if (error.status === 500) {
      errorMessage = 'Error del servidor';
    }
    
    return throwError(() => errorMessage);
  }

  // Productos endpoints
  crearProducto(form: FormData): Observable<void> {
    return this.http.post<void>('/api/crearProducto', form, {
      headers: this.withAuthHeaders().delete('Content-Type')
    }).pipe(catchError(this.handleError));
  }

  eliminarProducto(codeProduct: string): Observable<string | void> {
    return this.http.delete<string | void>(`/api/eliminarProducto?codeProduct=${codeProduct}`, {
      headers: this.withAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  actualizarDescripcionProducto(payload: UpdateDescriptionProductDto): Observable<void> {
    return this.http.put<void>('/api/actualizarDescripcionProducto', payload, {
      headers: this.withAuthHeaders().set('Content-Type', 'application/json')
    }).pipe(catchError(this.handleError));
  }

  actualizarImagenProducto(form: FormData): Observable<void> {
    return this.http.put<void>('/api/actualizarImagenProducto', form, {
      headers: this.withAuthHeaders().delete('Content-Type')
    }).pipe(catchError(this.handleError));
  }

  obtenerProductos(): Observable<Product[]> {
    return this.http.get<Product[]>('/api/obtenerProductos', {
      headers: this.withAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  obtenerProducto(codeProduct: string): Observable<Product> {
    return this.http.get<Product>(`/api/obtenerProducto?codeProduct=${codeProduct}`, {
      headers: this.withAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  obtenerInsumosDelProducto(codeProduct: string): Observable<Supply[]> {
    return this.http.post<Supply[]>(`/api/obtenerInsumosDelProducto?codeProduct=${codeProduct}`, null, {
      headers: this.withAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  obtenerMovimientos(): Observable<ProductMovement[]> {
    return this.http.get<ProductMovement[]>('/api/obtenerMovimientos', {
      headers: this.withAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  // Legacy endpoints (mantener compatibilidad)
  getProductsList(): Observable<any[]> {
    return this.obtenerProductos();
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