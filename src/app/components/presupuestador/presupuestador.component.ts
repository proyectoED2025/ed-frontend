import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { ContactosService, CustomerListItem } from '../../services/contactos.service';
import { PresupuestoService } from '../../services/presupuesto.service';
import {
  BudgetCreateDto,
  BudgetItem,
  CustomerDto,
  ProductBudgetDto,
  GLASS_TYPES,
  PRODUCT_TYPES,
  SERIES,
  GLASS_THICKNESS,
  COLORS
} from '../../models/budget.interfaces';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-presupuestador',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './presupuestador.component.html',
  styleUrls: ['./presupuestador.component.scss']
})
export class PresupuestadorComponent implements OnInit, OnDestroy {
  // Formularios y datos
  searchContacto: string = '';
  contactos: CustomerListItem[] = [];
  filteredContactos: CustomerListItem[] = [];
  selectedContacto: CustomerListItem | null = null;
  showContactDropdown: boolean = false;

  budgetItems: BudgetItem[] = [];

  // Estados
  error: string | null = null;
  success: string | null = null;
  loading: boolean = false;
  loadingContactos: boolean = false;
  isSubmitting: boolean = false;

  // Catálogos
  glassTypes = GLASS_TYPES;
  productTypes = PRODUCT_TYPES;
  series = SERIES;
  glassThickness = GLASS_THICKNESS;
  colors = COLORS;

  // Control de búsqueda
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Resultado del último presupuesto
  lastBudgetResult: any = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private contactosService: ContactosService,
    private presupuestoService: PresupuestoService
  ) {
    // Configurar búsqueda con debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.performSearch(searchTerm);
    });
  }

  ngOnInit() {
    this.loadContactos();
    this.loadDraft();
    this.initializeEmptyItem();

    // Suscribirse al último presupuesto generado
    this.presupuestoService.lastBudget$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(budget => {
      if (budget) {
        this.lastBudgetResult = budget;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    // Guardar borrador antes de salir
    if (this.budgetItems.length > 0 || this.selectedContacto) {
      this.saveDraft();
    }
  }

  loadContactos() {
    this.loadingContactos = true;
    // Por ahora usar el servicio list con paginación para traer todos los contactos
    this.contactosService.list({ page: 1, pageSize: 100 }).subscribe({
      next: (response) => {
        this.contactos = response.Items;
        this.loadingContactos = false;
      },
      error: (error) => {
        console.error('Error loading contacts:', error);
        // Usar datos de prueba si el backend no está disponible
        this.contactos = [];
        this.loadingContactos = false;
      }
    });
  }

  initializeEmptyItem() {
    const newItem: BudgetItem = {
      id: this.generateId(),
      Name: '',
      Width: 0,
      Heigth: 0,
      Color: '',
      amount: 1,
      GlassThickness: '4',
      GlassType: 1,  // Float por defecto
      TypeProduct: 0,  // Ventana por defecto
      Serie: 1,  // Serie 30 por defecto
      isValid: false
    };
    this.budgetItems.push(newItem);
  }

  onSearchContacto(event: any) {
    const value = event.target.value;
    this.searchContacto = value;
    this.searchSubject.next(value);
  }

  performSearch(searchTerm: string) {
    if (!searchTerm.trim()) {
      this.filteredContactos = [];
      this.showContactDropdown = false;
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    this.filteredContactos = this.contactos.filter(contacto =>
      contacto.Nombre.toLowerCase().includes(searchLower) ||
      contacto.Identificador.toLowerCase().includes(searchLower) ||
      contacto.Email.toLowerCase().includes(searchLower)
    );
    this.showContactDropdown = this.filteredContactos.length > 0;
  }

  selectContacto(contacto: CustomerListItem) {
    this.selectedContacto = contacto;
    this.searchContacto = contacto.Nombre;
    this.showContactDropdown = false;
    this.saveDraft();
  }

  clearContacto() {
    this.selectedContacto = null;
    this.searchContacto = '';
    this.filteredContactos = [];
    this.showContactDropdown = false;
  }

  // Gestión de items del presupuesto
  addItem() {
    const lastItem = this.budgetItems[this.budgetItems.length - 1];
    if (!lastItem || this.isItemValid(lastItem)) {
      this.initializeEmptyItem();
      // Focus en el nombre del nuevo item
      setTimeout(() => {
        const inputs = document.querySelectorAll('.item-name-input');
        const lastInput = inputs[inputs.length - 1] as HTMLInputElement;
        if (lastInput) lastInput.focus();
      }, 100);
    }
  }

  duplicateItem(index: number) {
    const item = this.budgetItems[index];
    const newItem: BudgetItem = {
      ...item,
      id: this.generateId(),
      Name: item.Name + ' (copia)'
    };
    this.budgetItems.splice(index + 1, 0, newItem);
    this.saveDraft();
  }

  removeItem(index: number) {
    if (this.budgetItems.length > 1) {
      this.budgetItems.splice(index, 1);
      this.saveDraft();
    }
  }

  onItemChange(item: BudgetItem) {
    item.isValid = this.isItemValid(item);
    this.saveDraft();
  }

  onItemKeyPress(event: KeyboardEvent, item: BudgetItem, fieldName: string) {
    if (event.key === 'Enter') {
      event.preventDefault();
      const index = this.budgetItems.indexOf(item);
      if (index === this.budgetItems.length - 1 && this.isItemValid(item)) {
        this.addItem();
      }
    }
  }

  isItemValid(item: BudgetItem): boolean {
    return !!(
      item.Name && item.Name.trim() &&
      item.Width > 0 &&
      item.Heigth > 0 &&
      item.Color && item.Color.trim() &&
      item.amount > 0 &&
      item.GlassThickness && Number(item.GlassThickness) > 0 &&
      item.GlassType !== null && item.GlassType !== undefined &&
      item.TypeProduct !== null && item.TypeProduct !== undefined &&
      item.Serie !== null && item.Serie !== undefined
    );
  }

  getValidItemsCount(): number {
    return this.budgetItems.filter(item => this.isItemValid(item)).length;
  }

  getTotalAmount(): number {
    return this.budgetItems
      .filter(item => this.isItemValid(item))
      .reduce((sum, item) => sum + (item.amount || 0), 0);
  }

  canSubmit(): boolean {
    return !!(
      this.selectedContacto &&
      this.getValidItemsCount() > 0 &&
      !this.isSubmitting
    );
  }

  grabarPresupuesto() {
    // limpiar mensajes
    this.error = null;
    this.success = null;

    // validaciones
    if (!this.canSubmit()) {
      if (!this.selectedContacto) {
        this.error = 'Por favor, seleccione un cliente';
      } else if (this.getValidItemsCount() === 0) {
        this.error = 'Por favor, agregue al menos un producto válido';
      }
      return;
    }

    this.isSubmitting = true;

    // solo items válidos
    const validItems = this.budgetItems.filter(item => this.isItemValid(item));

    // armar DTO tal como lo espera tu backend
    const budgetDto: BudgetCreateDto = {
      Cliente: {
        CustomerId: this.selectedContacto!.CustomerId,
        Nombre: this.selectedContacto!.Nombre,
        Identificador: this.selectedContacto!.Identificador || '',
        TipoDocumento: 'RUT',
        Email: this.selectedContacto!.Email || '',
        Telefono: this.selectedContacto!.Telefono || '',
        DireccionFiscal: '' // TODO: completar cuando lo provea el backend
      },
      Productos: validItems.map(item => ({
        Name: item.Name,
        Width: Number(item.Width),
        Heigth: Number(item.Heigth),
        Color: item.Color,
        amount: Number(item.amount),
        GlassThickness: String(item.GlassThickness),
        GlassType: Number(item.GlassType),     // asegurar número
        TypeProduct: Number(item.TypeProduct), // asegurar número
        Serie: Number(item.Serie)              // asegurar número
      }))
    };

    // crear presupuesto
    this.presupuestoService.crearPresupuesto(budgetDto).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;

        // normalizar Id -> siempre dejamos .id disponible
        const id = response?.id ?? response?.Id ?? null;
        this.lastBudgetResult = { ...response, id };

        this.success = `Presupuesto generado exitosamente (ID: ${id ?? 'N/A'})`;

        // Sugerencia: no resetees de inmediato para poder descargar el PDF.
        // Si querés limpiar luego de descargar, llamá a this.resetForm() después de downloadBudget().
        // setTimeout(() => this.resetForm(), 2000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.error = typeof err === 'string' ? err : 'Error al crear el presupuesto';
        console.error('Error creating budget:', err);
      }
    });
  }


  resetForm() {
    this.budgetItems = [];
    this.clearContacto();
    this.initializeEmptyItem();
    this.error = null;
    this.success = null;
    this.presupuestoService.clearDraft();
  }

  saveDraft() {
    if (this.budgetItems.length > 0 || this.selectedContacto) {
      this.presupuestoService.saveDraft(this.selectedContacto, this.budgetItems);
    }
  }

  loadDraft() {
    const draft = this.presupuestoService.loadDraft();
    if (draft) {
      if (draft.cliente) {
        this.selectedContacto = draft.cliente;
        this.searchContacto = draft.cliente.Nombre;
      }
      if (draft.items && draft.items.length > 0) {
        this.budgetItems = draft.items;
      }
    }
  }

  downloadBudget() {
    this.error = null; this.success = null;

    const id =
      this.lastBudgetResult?.id ??
      this.presupuestoService.getLastBudget()?.id;

    if (!id) {
      this.error = 'Generá un presupuesto primero.';
      return;
    }

    this.presupuestoService.descargarPresupuestoPdf(id).subscribe({
      next: (resp) =>
        this.presupuestoService.saveHttpResponseAsFile(resp, `Presupuesto-${id}.pdf`),
      error: (err) => {
        console.error('Error al descargar PDF:', err);
        this.error = 'No se pudo descargar el PDF.';
      }
    });
  }

  volverAlDashboard() {
    // Guardar borrador antes de salir
    this.saveDraft();
    this.router.navigate(['/dashboard']);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
