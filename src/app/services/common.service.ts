import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './authService';
import { Product, ProductDto, UpdateDescriptionProductDto, UpdateImageProductDto, Supply, ProductMovement } from '../models/product.interfaces';
import { buildApiUrl, buildApiUrlWithParams } from '../core/api-url';
import { API_ROUTES } from '../core/api-routes';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(private http: HttpClient, private authService: AuthService) { }

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
    return this.http.post<void>(buildApiUrl(API_ROUTES.CREAR_PRODUCTO), form).pipe(catchError(this.handleError));
  }

  eliminarProducto(codeProduct: string): Observable<string | void> {
    return this.http.delete<string | void>(buildApiUrlWithParams(API_ROUTES.ELIMINAR_PRODUCTO, { codeProduct })).pipe(catchError(this.handleError));
  }

  actualizarDescripcionProducto(payload: UpdateDescriptionProductDto): Observable<void> {
    return this.http.put<void>(buildApiUrl(API_ROUTES.ACTUALIZAR_DESCRIPCION_PRODUCTO), payload).pipe(catchError(this.handleError));
  }

  actualizarImagenProducto(form: FormData): Observable<void> {
    return this.http.put<void>(buildApiUrl(API_ROUTES.ACTUALIZAR_IMAGEN_PRODUCTO), form).pipe(catchError(this.handleError));
  }

  obtenerProductos(): Observable<ProductDto[]> {
    return this.http.get<ProductDto[]>(buildApiUrl(API_ROUTES.OBTENER_PRODUCTOS)).pipe(catchError(this.handleError));
  }

  obtenerProducto(codeProduct: string): Observable<Product> {
    return this.http.get<Product>(buildApiUrlWithParams(API_ROUTES.OBTENER_PRODUCTO, { codeProduct })).pipe(catchError(this.handleError));
  }

  obtenerInsumosDelProducto(codeProduct: string): Observable<Supply[]> {
    return this.http.post<Supply[]>(buildApiUrlWithParams(API_ROUTES.OBTENER_INSUMOS_PRODUCTO, { codeProduct }), null).pipe(catchError(this.handleError));
  }

  obtenerMovimientos(): Observable<ProductMovement[]> {
    return this.http.get<ProductMovement[]>(buildApiUrl(API_ROUTES.OBTENER_MOVIMIENTOS)).pipe(catchError(this.handleError));
  }

  // Legacy endpoints (mantener compatibilidad)
  getProductsList(): Observable<any[]> {
    return this.obtenerProductos();
  }

  getSalesList(): Observable<any[]> {
    return this.http.get<any[]>(buildApiUrl(API_ROUTES.SALES));
  }

  getStockMovements(): Observable<any[]> {
    return this.http.get<any[]>(buildApiUrl(API_ROUTES.STOCK_MOVEMENTS));
  }

  getDashboardData(): Observable<any> {
    return this.http.get<any>(buildApiUrl(API_ROUTES.RESUMEN)).pipe(catchError(this.handleError));
  }
}
