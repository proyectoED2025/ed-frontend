import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './authService';

@Injectable({
  providedIn: 'root'
})
export class PresupuestoService {
  private apiUrl = '/api/crearPresupuesto';

  constructor(private http: HttpClient, private authService: AuthService) {}

  crearPresupuesto(dto: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(this.apiUrl, dto, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 400) {
          const errorMessage = error.error?.message || 'Datos inválidos';
          return throwError(() => errorMessage);
        } else if (error.status === 401) {
          return throwError(() => 'No autorizado');
        } else if (error.status === 500) {
          const errorMessage = error.error?.message || 'Error del servidor';
          return throwError(() => errorMessage);
        }
        return throwError(() => 'Error desconocido');
      })
    );
  }
}
