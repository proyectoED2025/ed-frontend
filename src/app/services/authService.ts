import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loginUrl = '/api/loginUsuario';
  private registerUrl = '/api/registroUsuario';
  private confirmEmailUrl = '/api/confirm-email';
  private tokenKey = 'auth_token';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  
  constructor(private http: HttpClient, private router: Router) {}

  login(loginData: { userName: string, password: string }): Observable<any> {
    return this.http.post(this.loginUrl, loginData).pipe(
      map((response: any) => {
        if (response && response.token) {
          this.setToken(response.token);
          this.isAuthenticatedSubject.next(true);
          return response;
        }
        throw new Error('No token received');
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return throwError(() => 'Credenciales incorretas');
        } else if (error.status === 403 || error.status === 500) {
          const errorMessage = error.error?.message || 'Error del servidor';
          return throwError(() => errorMessage);
        }
        return throwError(() => 'Error desconocido');
      })
    );
  }
  register(registerData: { name: string, userEmail: string, userName: string, phoneNumber: string, password: string }): Observable<any> {
    return this.http.post(this.registerUrl, registerData, { responseType: 'text' }).pipe(
      map((response: any) => {
        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return throwError(() => 'El correo ya está registrado.');
        } else if (error.status === 400) {
          const errorMessage = error.error?.message || 'Datos inválidos';
          return throwError(() => errorMessage);
        }
        return throwError(() => 'Error desconocido');
      })
    );
  }

  confirmEmail(token: string): Observable<any> {
    return this.http.post(this.confirmEmailUrl, { token }, { responseType: 'text' }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 400) {
          return throwError(() => 'Token es invalido o se expiro');
        } else if (error.status === 500) {
          const errorMessage = error.error?.message || 'Error del servidor';
          return throwError(() => errorMessage);
        }
        return throwError(() => 'Error desconocido');
      })
    );
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  checkAuthStatus(): void {
    const token = this.getToken();
    this.isAuthenticatedSubject.next(!!token);
    if (!token) {
      this.router.navigate(['/login']);
    }
  }

  getCurrentUser(): Observable<any> {
    return new Observable(observer => {
      observer.next({ name: 'Usuario' });
      observer.complete();
    });
  }

  getCurrentCompany(): Observable<any> {
    return new Observable(observer => {
      observer.next({ name: 'Stock Manager' });
      observer.complete();
    });
  }
}
