import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactosService {

  constructor(private http: HttpClient) { }

  getContactos(): Observable<any[]> {
    return this.http.get<any[]>('/api/contactos');
  }

  addContacto(contacto: any): Observable<any> {
    return this.http.post<any>('/api/contactos', contacto);
  }

  updateContacto(contacto: any): Observable<any> {
    return this.http.put<any>(`/api/contactos/${contacto.id}`, contacto);
  }

  deleteContacto(id: number): Observable<any> {
    return this.http.delete<any>(`/api/contactos/${id}`);
  }
}