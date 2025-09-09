import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { buildApiUrl } from '../core/api-url';
import { API_ROUTES } from '../core/api-routes';

export interface Direccion {
  Calle: string;
  Numero: string;
  Ciudad: string;
  Departamento: string;
  CodigoPostal: string;
  Pais: string;
}

export interface Customer {
  CustomerId: number;
  Nombre: string;
  Identificador: string;
  TipoDocumento: string;
  Email: string;
  Telefono: string;
  DireccionFiscal: Direccion;
}

export interface CustomerListItem {
  CustomerId: number;
  Nombre: string;
  Identificador: string;
  Email: string;
  Telefono: string;
}

export interface CustomerCreatePayload {
  Nombre: string;
  Identificador: string;
  TipoDocumento?: string;
  Email?: string;
  Telefono?: string;
  DireccionFiscal: Direccion;
}

export interface CustomerUpdatePayload extends CustomerCreatePayload {}

export interface CustomerListResponse {
  total: number;
  page: number;
  pageSize: number;
  Items: CustomerListItem[];
}

export interface CustomerListParams {
  page: number;
  pageSize: number;
  q?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class ContactosService {

  constructor(private http: HttpClient) { }

  list(params: CustomerListParams): Observable<CustomerListResponse> {
    let httpParams = new HttpParams()
      .set('page', params.page?.toString() || '1')
      .set('pageSize', params.pageSize?.toString() || '25');

    if (params.q) {
      httpParams = httpParams.set('q', params.q);
    }
    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.sortDir) {
      httpParams = httpParams.set('sortDir', params.sortDir);
    }

    return this.http.get<CustomerListResponse>(buildApiUrl(API_ROUTES.CUSTOMERS), { params: httpParams });
  }

  create(payload: CustomerCreatePayload): Observable<Customer> {
    return this.http.post<Customer>(buildApiUrl(API_ROUTES.CUSTOMERS), payload);
  }

  update(id: number, payload: CustomerUpdatePayload): Observable<Customer> {
    return this.http.put<Customer>(buildApiUrl(`${API_ROUTES.CUSTOMERS}/${id}`), payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(buildApiUrl(`${API_ROUTES.CUSTOMERS}/${id}`));
  }

  getById(id: number): Observable<Customer> {
    return this.http.get<Customer>(buildApiUrl(`${API_ROUTES.CUSTOMERS}/${id}`));
  }

  getContactos(): Observable<any[]> {
    return this.http.get<any[]>(buildApiUrl(API_ROUTES.CONTACTOS));
  }

  addContacto(contacto: any): Observable<any> {
    return this.http.post<any>(buildApiUrl(API_ROUTES.CONTACTOS), contacto);
  }

  updateContacto(contacto: any): Observable<any> {
    return this.http.put<any>(buildApiUrl(`${API_ROUTES.CONTACTOS}/${contacto.id}`), contacto);
  }

  deleteContacto(id: number): Observable<any> {
    return this.http.delete<any>(buildApiUrl(`${API_ROUTES.CONTACTOS}/${id}`));
  }
}
