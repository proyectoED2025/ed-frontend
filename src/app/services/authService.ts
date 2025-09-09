import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { buildApiUrl } from '../core/api-url';
import { API_ROUTES } from '../core/api-routes';

export interface User {
  id: string;
  name: string;
  userName: string;
  userEmail: string;
  phoneNumber: string;
  isEmailConfirmed: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface Session {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.hydrateFromStorage();
  }

  login(loginData: { userName: string, password: string }, rememberMe: boolean = true): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(buildApiUrl(API_ROUTES.LOGIN), loginData).pipe(
      map((response: LoginResponse) => {
        if (response && response.token && response.user) {
          const sanitizedUser = this.sanitizeUser(response.user);
          this.setSession({ token: response.token, user: sanitizedUser }, rememberMe ? 'local' : 'session');
          return { token: response.token, user: sanitizedUser };
        }
        throw new Error('No token or user received');
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return throwError(() => 'Credenciales incorrectas');
        } else  {
          const errorMessage = error?.error?.message || 'Error del servidor';
          return throwError(() => errorMessage);
        }
      })
    );
  }
  register(registerData: { name: string, userEmail: string, userName: string, phoneNumber: string, password: string }): Observable<any> {
    return this.http.post(buildApiUrl(API_ROUTES.REGISTER), registerData, { responseType: 'text' }).pipe(
      map((response: any) => {
        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return throwError(() => 'El correo ya está registrado.');
        } else {
          const errorMessage = error.error?.message || 'Datos inválidos';
          return throwError(() => errorMessage);
        }
        return throwError(() => 'Error desconocido');
      })
    );
  }

  confirmEmail(token: string): Observable<any> {
    return this.http.post(buildApiUrl(API_ROUTES.CONFIRM_EMAIL), { token }, { responseType: 'text' }).pipe(
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

  private sanitizeUser(user: any): User {
    return {
      id: user.id,
      name: user.name,
      userName: user.userName,
      userEmail: user.userEmail,
      phoneNumber: user.phoneNumber,
      isEmailConfirmed: user.isEmailConfirmed
    };
  }

  setSession(session: Session, persist: 'local' | 'session' = 'local'): void {
    console.log('Guardando sesión:', { user: session.user, persist });
    const storage = persist === 'local' ? localStorage : sessionStorage;
    storage.setItem(this.tokenKey, session.token);
    storage.setItem(this.userKey, JSON.stringify(session.user));

    // Actualizar los subjects con los nuevos datos
    this.currentUserSubject.next(session.user);
    this.isAuthenticatedSubject.next(true);
    console.log('Usuario guardado en memoria:', session.user);
  }

  getSession(): Session | null {
    let token = localStorage.getItem(this.tokenKey);
    let userStr = localStorage.getItem(this.userKey);

    if (!token || !userStr) {
      token = sessionStorage.getItem(this.tokenKey);
      userStr = sessionStorage.getItem(this.userKey);
    }

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        return { token, user };
      } catch {
        this.clearSession();
        return null;
      }
    }

    return null;
  }

  getToken(): string | null {
    const session = this.getSession();
    return session?.token || null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getCurrentUserObservable(): Observable<User | null> {
    return this.currentUser$;
  }

  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userKey);
  }

  hydrateFromStorage(): void {
    console.log('Hidratando desde storage...');
    const session = this.getSession();
    if (session && session.user) {
      console.log('Sesión encontrada, hidratando usuario:', session.user);
      this.currentUserSubject.next(session.user);
      this.isAuthenticatedSubject.next(true);
    } else {
      console.log('No hay sesión válida en storage');
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);
    }
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  logout(): void {
    this.clearSession();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  checkAuthStatus(): void {
    this.hydrateFromStorage();
    if (!this.getToken()) {
      this.router.navigate(['/login']);
    }
  }

  getCurrentCompany(): Observable<any> {
    return new Observable(observer => {
      observer.next({ name: 'Stock Manager' });
      observer.complete();
    });
  }
}
