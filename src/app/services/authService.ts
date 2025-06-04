import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loginUrl = '/api/login';
  private registerUrl = '/api/register';

  constructor(private http: HttpClient) {}

  login(data: any): Observable<any> {
    return this.http.post(this.loginUrl, data, { observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => {
        if (response.status === 200) {
          return response.body;
        }
        throw new Error('Unexpected response');
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 400) {
          return throwError(() => 'Credenciales inválidas');
        } else if (error.status === 401) {
          return throwError(() => 'No autorizado');
        } else if (error.status === 500) {
          return throwError(() => 'Error del servidor');
        }
        return throwError(() => 'Error desconocido');
      })
    );
  }
// prueba
  register(data: any): Observable<any> {
    return this.http.post(this.registerUrl, data, { observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => {
        if (response.status === 200 || response.status === 201) {
          return response.body;
        }
        throw new Error('Unexpected response');
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 400) {
          return throwError(() => 'Datos inválidos');
        } else if (error.status === 409) {
          return throwError(() => 'Usuario ya registrado');
        } else if (error.status === 500) {
          return throwError(() => 'Error del servidor');
        }
        return throwError(() => 'Error desconocido');
      })
    );
  }
}
