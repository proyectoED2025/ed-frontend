import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
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

  crearPresupuesto(dto: BudgetCreateDto): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(buildApiUrl(API_ROUTES.CREAR_PRESUPUESTO), dto, { headers }).pipe(
      tap(response => {
        this.lastBudgetSubject.next(response);
        this.clearDraft();
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 400) {
          const errorMessage = error.error?.message || error.error?.BudgetException || 'Datos inválidos';
          return throwError(() => errorMessage);
        } else if (error.status === 401) {
          return throwError(() => 'No autorizado. Por favor, inicie sesión nuevamente.');
        } else if (error.status === 403) {
          return throwError(() => 'No tiene permisos para crear presupuestos');
        } else if (error.status === 500) {
          const errorMessage = error.error?.message || 'Error del servidor';
          return throwError(() => errorMessage);
        }
        return throwError(() => 'Error desconocido al crear el presupuesto');
      })
    );
  }

  saveDraft(cliente: any, items: BudgetItem[]): void {
    const draft = { cliente, items, timestamp: new Date().toISOString() };
    localStorage.setItem(this.draftKey, JSON.stringify(draft));
  }

  loadDraft(): any {
    const draftStr = localStorage.getItem(this.draftKey);
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr);
        // Verificar que el borrador no tenga más de 24 horas
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
