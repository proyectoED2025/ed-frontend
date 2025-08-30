import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ContactosService } from '../../services/contactos.service';
import { PresupuestoService } from '../../services/presupuesto.service';

@Component({
  selector: 'app-presupuestador',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './presupuestador.component.html',
  styleUrls: ['./presupuestador.component.scss']
})
export class PresupuestadorComponent implements OnInit {
  presupuestoForm: FormGroup;
  searchContacto: string = '';
  contactos: any[] = [];
  filteredContactos: any[] = [];
  selectedContacto: any = null;
  showContactDropdown: boolean = false;
  error: string | null = null;
  success: string | null = null;
  loading: boolean = false;

  tiposProducto = [
    { value: '', label: 'Seleccionar tipo' },
    { value: 'ventana', label: 'Ventana' },
    { value: 'puerta', label: 'Puerta' },
    { value: 'mamparas', label: 'Mamparas' },
    { value: 'divisorias', label: 'Divisorias' },
    { value: 'frentes', label: 'Frentes' }
  ];

  tiposVidrio = [
    { value: '', label: 'Seleccionar vidrio' },
    { value: 'simple', label: 'Vidrio Simple' },
    { value: 'laminado', label: 'Vidrio Laminado' },
    { value: 'templado', label: 'Vidrio Templado' },
    { value: 'doble', label: 'Doble Vidriado Hermético (DVH)' },
    { value: 'triple', label: 'Triple Vidriado' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private contactosService: ContactosService,
    private presupuestoService: PresupuestoService
  ) {
    this.presupuestoForm = this.formBuilder.group({
      tipoProducto: ['', Validators.required],
      serie: ['', Validators.required],
      tipoVidrio: ['', Validators.required],
      espesor: ['', [Validators.required, Validators.min(1)]],
      ancho: ['', [Validators.required, Validators.min(1)]],
      alto: ['', [Validators.required, Validators.min(1)]],
      color: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    this.loadContactos();
  }

  loadContactos() {
    this.contactosService.getContactos().subscribe({
      next: (data) => {
        this.contactos = data;
      },
      error: (error) => {
        console.error('Error loading contacts:', error);
        // Load test data when API fails
        this.contactos = [
          {
            id: 1,
            nombre: 'María González',
            email: 'maria.gonzalez@techsolutions.com',
            telefono: '+54 11 4567-8901',
            empresa: 'Tech Solutions SA'
          },
          {
            id: 2,
            nombre: 'Carlos Rodríguez',
            email: 'carlos.rodriguez@innovatech.com.ar',
            telefono: '+54 9 2615 123-456',
            empresa: 'InnovaTech Argentina'
          },
          {
            id: 3,
            nombre: 'Ana Fernández',
            email: 'ana.fernandez@digitalcorp.com',
            telefono: '+54 11 9876-5432',
            empresa: 'Digital Corp'
          }
        ];
      }
    });
  }

  onSearchContacto() {
    if (!this.searchContacto.trim()) {
      this.filteredContactos = [];
      this.showContactDropdown = false;
      return;
    }

    const searchLower = this.searchContacto.toLowerCase();
    this.filteredContactos = this.contactos.filter(contacto =>
      contacto.nombre.toLowerCase().includes(searchLower) ||
      contacto.empresa.toLowerCase().includes(searchLower) ||
      contacto.email.toLowerCase().includes(searchLower)
    );
    this.showContactDropdown = this.filteredContactos.length > 0;
  }

  selectContacto(contacto: any) {
    this.selectedContacto = contacto;
    this.searchContacto = contacto.nombre;
    this.showContactDropdown = false;
  }

  clearContacto() {
    this.selectedContacto = null;
    this.searchContacto = '';
    this.filteredContactos = [];
    this.showContactDropdown = false;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.presupuestoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.presupuestoForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors['min']) {
        return 'El valor debe ser mayor a 0';
      }
    }
    return '';
  }

  grabarPresupuesto() {
    if (this.presupuestoForm.valid && this.selectedContacto) {
      this.loading = true;
      this.error = null;
      this.success = null;

      const formValues = this.presupuestoForm.value;
      
      const budgetDto = {
        Cliente: {
          CustomerId: this.selectedContacto.id,
          Nombre: this.selectedContacto.nombre,
          Identificador: this.selectedContacto.identificador || '',
          TipoDocumento: this.selectedContacto.tipoDocumento || 'CI',
          Email: this.selectedContacto.email,
          Telefono: this.selectedContacto.telefono,
          DireccionFiscal: this.selectedContacto.direccion || ''
        },
        Productos: [{
          Name: `${formValues.tipoProducto} - ${formValues.serie}`,
          Width: formValues.ancho,
          Heigth: formValues.alto,
          Color: formValues.color,
          amount: formValues.cantidad,
          GlassThickness: formValues.espesor,
          GlassType: formValues.tipoVidrio,
          TypeProduct: formValues.tipoProducto,
          Serie: formValues.serie
        }]
      };

      this.presupuestoService.crearPresupuesto(budgetDto).subscribe({
        next: (response) => {
          this.loading = false;
          this.success = 'Presupuesto creado correctamente';
          this.presupuestoForm.reset();
          this.clearContacto();
        },
        error: (err) => {
          this.loading = false;
          this.error = typeof err === 'string' ? err : 'Error al crear presupuesto';
        }
      });
    } else {
      Object.keys(this.presupuestoForm.controls).forEach(key => {
        this.presupuestoForm.get(key)?.markAsTouched();
      });
      
      if (!this.selectedContacto) {
        this.error = 'Por favor, seleccione un contacto';
      } else {
        this.error = 'Por favor, complete todos los campos requeridos';
      }
    }
  }

  volverAlDashboard() {
    this.router.navigate(['/dashboard']);
  }
}