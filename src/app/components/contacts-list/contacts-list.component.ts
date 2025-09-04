import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataTableComponent, DataTableColumn, DataTableButton } from '../data-table/data-table.component';
import { ContactosService, CustomerListItem, CustomerCreatePayload, CustomerUpdatePayload, Customer, Direccion } from '../../services/contactos.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-contacts-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DataTableComponent],
  templateUrl: './contacts-list.component.html',
  styleUrls: ['./contacts-list.component.scss']
})
export class ContactsListComponent implements OnInit, OnDestroy {
  rows: CustomerListItem[] = [];
  total: number = 0;
  page: number = 1;
  pageSize: number = 10;
  q: string = '';
  sortBy: string = 'Nombre';
  sortDir: 'asc' | 'desc' = 'asc';
  loading: boolean = false;

  showModal: boolean = false;
  isEditing: boolean = false;
  contactForm: FormGroup;
  currentContact: Customer | null = null;
  error: string | null = null;
  success: string | null = null;

  Math = Math;
  private searchSubject = new Subject<string>();

  columns: DataTableColumn[] = [
    { key: 'CustomerId', label: 'ID' },
    { key: 'Nombre', label: 'Nombre' },
    { key: 'Identificador', label: 'Identificador' },
    { key: 'Email', label: 'Email' },
    { key: 'Telefono', label: 'Teléfono' }
  ];

  buttons: DataTableButton[] = [
    { id: 'edit', label: '✏️', class: 'btn-primary' },
    { id: 'delete', label: '🗑️', class: 'btn-danger' }
  ];

  constructor(
    private contactosService: ContactosService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.contactForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      identificador: ['', Validators.required],
      tipoDocumento: ['RUT'],
      email: ['', [Validators.email]],
      telefono: [''],
      direccionFiscal: this.formBuilder.group({
        calle: [''],
        numero: [''],
        ciudad: [''],
        departamento: [''],
        codigoPostal: [''],
        pais: ['Uruguay']
      })
    });
  }

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.q = searchTerm;
      this.page = 1;
      this.reload();
    });

    this.reload();
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }

  reload() {
    this.loading = true;
    this.error = null;

    this.contactosService.list({
      page: this.page,
      pageSize: this.pageSize,
      q: this.q || undefined,
      sortBy: this.sortBy || undefined,
      sortDir: this.sortDir
    }).subscribe({
      next: (response) => {
        this.rows = response.Items;
        this.total = response.total;
        this.page = response.page;
        this.pageSize = response.pageSize;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading contacts:', error);
        this.error = 'Error al cargar contactos';
        this.loading = false;
        this.total = 2;
      }
    });
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.reload();
  }

  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.page = 1;
    this.reload();
  }

  onSortChange(field: string, dir: 'asc' | 'desc') {
    this.sortBy = field;
    this.sortDir = dir;
    this.reload();
  }

  onSearch(query: string) {
    this.searchSubject.next(query);
  }

  onCreate() {
    this.isEditing = false;
    this.currentContact = null;
    this.contactForm.reset({
      tipoDocumento: 'RUT',
      direccionFiscal: {
        calle: '',
        numero: '',
        ciudad: '',
        departamento: '',
        codigoPostal: '',
        pais: 'Uruguay'
      }
    });
    this.showModal = true;
  }

  onEdit(row: CustomerListItem) {
    this.isEditing = true;
    this.loading = true;

    this.contactosService.getById(row.CustomerId).subscribe({
      next: (customer) => {
        this.currentContact = customer;
        this.contactForm.patchValue({
          nombre: customer.Nombre,
          identificador: customer.Identificador,
          tipoDocumento: customer.TipoDocumento || 'RUT',
          email: customer.Email || '',
          telefono: customer.Telefono || '',
          direccionFiscal: {
            calle: customer.DireccionFiscal?.Calle || '',
            numero: customer.DireccionFiscal?.Numero || '',
            ciudad: customer.DireccionFiscal?.Ciudad || '',
            departamento: customer.DireccionFiscal?.Departamento || '',
            codigoPostal: customer.DireccionFiscal?.CodigoPostal || '',
            pais: customer.DireccionFiscal?.Pais || 'Uruguay'
          }
        });
        this.loading = false;
        this.showModal = true;
      },
      error: (error) => {
        console.error('Error loading customer details:', error);
        this.error = 'Error al cargar detalles del contacto';
        this.loading = false;
      }
    });
  }

  onDelete(row: CustomerListItem) {
    if (confirm(`¿Está seguro que desea eliminar el contacto ${row.Nombre}?`)) {
      this.loading = true;

      this.contactosService.delete(row.CustomerId).subscribe({
        next: () => {
          this.success = 'Contacto eliminado correctamente';

          const totalPages = Math.ceil(this.total / this.pageSize);
          if (this.page > totalPages && this.page > 1) {
            this.page--;
          }

          this.reload();
        },
        error: (error) => {
          console.error('Error deleting contact:', error);
          this.error = 'Error al eliminar contacto';
          this.loading = false;
        }
      });
    }
  }

  onButtonClick(event: { buttonId: string, row: any, index: number }) {
    if (event.buttonId === 'edit') {
      this.onEdit(event.row);
    } else if (event.buttonId === 'delete') {
      this.onDelete(event.row);
    }
  }

  onSaveContact() {
    if (this.contactForm.valid) {
      this.loading = true;
      this.error = null;

      const formValue = this.contactForm.value;

      const payload: CustomerCreatePayload | CustomerUpdatePayload = {
        Nombre: formValue.nombre,
        Identificador: formValue.identificador,
        TipoDocumento: formValue.tipoDocumento || 'RUT',
        Email: formValue.email || undefined,
        Telefono: formValue.telefono || undefined,
        DireccionFiscal: {
          Calle: formValue.direccionFiscal.calle || '',
          Numero: formValue.direccionFiscal.numero || '',
          Ciudad: formValue.direccionFiscal.ciudad || '',
          Departamento: formValue.direccionFiscal.departamento || '',
          CodigoPostal: formValue.direccionFiscal.codigoPostal || '',
          Pais: formValue.direccionFiscal.pais || 'Uruguay'
        }
      };

      const operation = this.isEditing
        ? this.contactosService.update(this.currentContact!.CustomerId, payload)
        : this.contactosService.create(payload);

      operation.subscribe({
        next: () => {
          this.loading = false;
          this.success = this.isEditing ? 'Contacto actualizado correctamente' : 'Contacto creado correctamente';
          this.closeModal();
          // Refresh the list after a brief delay to ensure the modal has closed
          setTimeout(() => {
            this.reload();
          }, 100);
        },
        error: (error) => {
          console.error('Error saving contact:', error);
          this.error = 'Error al guardar contacto';
          this.loading = false;
        }
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.contactForm.reset();
    this.currentContact = null;
    this.isEditing = false;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  clearMessages() {
    this.error = null;
    this.success = null;
  }

  onRefresh() {
    this.clearMessages();
    this.reload();
  }

  volverAlDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
