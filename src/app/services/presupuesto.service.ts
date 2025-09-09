import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { AuthService } from './authService';
import { BudgetCreateDto, BudgetItem } from '../models/budget.interfaces';
import { buildApiUrl } from '../core/api-url';
import { API_ROUTES } from '../core/api-routes';

@Injectable({
  providedIn: 'root'
})
export class PresupuestoService {
  private draftKey = 'presupuesto_draft';
  private lastBudgetSubject = new BehaviorSubject<any>(null);
  public lastBudget$ = this.lastBudgetSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    this.loadDraft();
  }

  // ---------- NUEVO: headers con token ----------
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  crearPresupuesto(dto: BudgetCreateDto): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(buildApiUrl(API_ROUTES.CREAR_PRESUPUESTO), dto, { headers }).pipe(
      tap((response: any) => {
        const normalized = { ...response, id: response?.id ?? response?.Id }; // 👈 normaliza
        this.lastBudgetSubject.next(normalized);
        this.clearDraft();
      }),
      catchError((error: HttpErrorResponse) => {
        // 👇 agrega 'mensaje' (tu controller devuelve { mensaje: ... })
        if (error.status === 400) {
          const errorMessage =
            error.error?.mensaje ||
            error.error?.message ||
            error.error?.BudgetException ||
            'Datos inválidos';
          return throwError(() => errorMessage);
        } else if (error.status === 401) {
          return throwError(() => 'No autorizado. Por favor, inicie sesión nuevamente.');
        } else if (error.status === 403) {
          return throwError(() => 'No tiene permisos para crear presupuestos');
        } else if (error.status === 500) {
          const errorMessage = error.error?.mensaje || error.error?.message || 'Error del servidor';
          return throwError(() => errorMessage);
        }
        return throwError(() => 'Error desconocido al crear el presupuesto');
      })
    );
  }

  // ---------- NUEVO: GET del PDF ----------
  descargarPresupuestoPdf(id: number): Observable<HttpResponse<Blob>> {
    const headers = this.getAuthHeaders();
    return this.http.get(buildApiUrl(API_ROUTES.PDF(id)), {
      headers,
      observe: 'response',
      responseType: 'blob'
    });
  }

  // ---------- NUEVO: helper para guardar la respuesta como archivo ----------
  saveHttpResponseAsFile(resp: HttpResponse<Blob>, fallbackName: string): void {
    let filename = fallbackName;
    const cd = resp.headers.get('content-disposition');
    const match = cd?.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i);
    if (match?.[1]) filename = match[1].replaceAll('"', '');

    const blob = new Blob([resp.body!], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    window.URL.revokeObjectURL(url);
  }

  // ---------- NUEVO (opcional): crear y descargar en un solo paso ----------
  crearYDescargarPresupuesto(dto: BudgetCreateDto): Observable<HttpResponse<Blob>> {
    let newId = 0;
    return this.crearPresupuesto(dto).pipe(
      tap((r: any) => { newId = r?.id; }),
      switchMap(() => this.descargarPresupuestoPdf(newId))
    );
  }

  // ========== borrador (lo tuyo, sin cambios) ==========
  saveDraft(cliente: any, items: BudgetItem[]): void {
    const draft = { cliente, items, timestamp: new Date().toISOString() };
    localStorage.setItem(this.draftKey, JSON.stringify(draft));
  }

  loadDraft(): any {
    const draftStr = localStorage.getItem(this.draftKey);
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr);
        const draftDate = new Date(draft.timestamp);
        const now = new Date();
        const hoursDiff = (now.getTime() - draftDate.getTime()) / (1000 * 60 * 60);
        if (hoursDiff < 24) {
          return draft;
        } else {
          this.clearDraft();
        }
      } catch (e) {
        console.error('Error loading draft:', e);
        this.clearDraft();
      }
    }
    return null;
  }

  clearDraft(): void {
    localStorage.removeItem(this.draftKey);
  }

  getLastBudget(): any {
    return this.lastBudgetSubject.value;
  }
}
