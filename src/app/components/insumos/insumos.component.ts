import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { InsumosService } from '../../services/insumos.service';
import {
  TypeSupply,
  ProfileDto,
  GlassDto,
  AccessoryDto,
  SupplyBase,
  GlassType,
  GlassTypeLabels,
  DeleteSupplyDto,
  EditSupplyDto,
  EditPriceSupplyDto
} from '../../models/supply.models';

@Component({
  selector: 'app-insumos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './insumos.component.html',
  styleUrls: ['./insumos.component.scss']
})
export class InsumosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  currentTab: TypeSupply = TypeSupply.Profile;
  supplyForm: FormGroup;
  editPriceForm: FormGroup;
  editDescriptionForm: FormGroup;
  
  // State management
  isLoading = false;
  isRefreshingAll = false;
  isRefreshingTab = false;
  addPanelCollapsed = false;
  searchQuery = '';
  currentPage = 1;
  pageSize = 10;
  
  // Data collections
  all: SupplyBase[] = [];
  profiles: SupplyBase[] = [];
  glasses: SupplyBase[] = [];
  accessories: SupplyBase[] = [];
  
  // UI state
  filteredSupplies: SupplyBase[] = [];
  total = 0;
  showEditPriceModal = false;
  showEditDescriptionModal = false;
  editingSupply: SupplyBase | null = null;
  selectedFile: File | null = null;
  
  // Loading states per row
  rowLoadingStates: { [codeSupply: string]: boolean } = {};
  
  successMessage = '';
  errorMessage = '';
  
  readonly TypeSupply = TypeSupply;
  readonly GlassType = GlassType;
  readonly GlassTypeLabels = GlassTypeLabels;
  readonly glassTypeOptions = Object.values(GlassType).filter(v => typeof v === 'number') as GlassType[];

  readonly typeLabels = {
    [TypeSupply.Profile]: 'Perfil',
    [TypeSupply.Glass]: 'Vidrio', 
    [TypeSupply.Accessory]: 'Accesorio'
  };

  readonly typePlurals = {
    [TypeSupply.Profile]: 'Perfiles',
    [TypeSupply.Glass]: 'Vidrios',
    [TypeSupply.Accessory]: 'Accesorios'  
  };
  
  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private insumosService: InsumosService,
    private router: Router
  ) {
    this.supplyForm = this.createSupplyForm();
    this.editPriceForm = this.createEditPriceForm();
    this.editDescriptionForm = this.createEditDescriptionForm();
  }

  ngOnInit(): void {
    this.loadAllSupplies();
    this.setupSearch();
    this.restoreStateFromStorage();
    
    // Subscribe to cache updates
    this.subscriptions.add(
      this.insumosService.profiles$.pipe(takeUntil(this.destroy$)).subscribe(profiles => {
        this.profiles = profiles;
        this.updateCurrentTabData();
      })
    );
    
    this.subscriptions.add(
      this.insumosService.glasses$.pipe(takeUntil(this.destroy$)).subscribe(glasses => {
        this.glasses = glasses;
        this.updateCurrentTabData();
      })
    );
    
    this.subscriptions.add(
      this.insumosService.accessories$.pipe(takeUntil(this.destroy$)).subscribe(accessories => {
        this.accessories = accessories;
        this.updateCurrentTabData();
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.unsubscribe();
    this.saveStateToStorage();
  }

  private createSupplyForm(): FormGroup {
    return this.fb.group({
      // Common fields
      codeSupply: ['', [Validators.required, Validators.minLength(3)]],
      nameSupply: ['', [Validators.required, Validators.minLength(3)]],
      descriptionSupply: ['', [Validators.required]],
      nameSupplier: ['', [Validators.required]],
      priceSupply: [0, [Validators.required, Validators.min(0.01)]],
      Image: [null],
      
      // Profile specific
      profileWeigth: [0, [Validators.min(0)]],
      profileHeigth: [0, [Validators.min(0)]],
      weigthMetro: [0, [Validators.min(0)]],
      profileColor: [''],
      
      // Glass specific
      glassThickness: [0, [Validators.min(0)]],
      glassLength: [0, [Validators.min(0)]],
      glassWidth: [0, [Validators.min(0)]],
      glassType: [GlassType.Float],
      
      // Accessory specific
      descriptionAccessory: ['']
    });
  }

  private createEditPriceForm(): FormGroup {
    return this.fb.group({
      priceSupply: [0, [Validators.required, Validators.min(0.01)]]
    });
  }

  private createEditDescriptionForm(): FormGroup {
    return this.fb.group({
      descriptionSupply: ['', [Validators.required]]
    });
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.applySearch();
    });
  }

  switchTab(tab: TypeSupply): void {
    this.currentTab = tab;
    this.resetForm();
    this.updateCurrentTabData();
    this.clearMessages();
  }

  onSearch(): void {
    this.searchSubject.next(this.searchQuery);
  }

  private applySearch(): void {
    let currentSupplies: SupplyBase[] = [];
    
    switch (this.currentTab) {
      case TypeSupply.Profile:
        currentSupplies = this.profiles;
        break;
      case TypeSupply.Glass:
        currentSupplies = this.glasses;
        break;
      case TypeSupply.Accessory:
        currentSupplies = this.accessories;
        break;
    }
    
    if (!this.searchQuery.trim()) {
      this.filteredSupplies = [...currentSupplies];
    } else {
      const query = this.searchQuery.toLowerCase().trim();
      this.filteredSupplies = currentSupplies.filter(supply =>
        supply.codeSupply.toLowerCase().includes(query) ||
        supply.nameSupply.toLowerCase().includes(query)
      );
    }
    
    this.total = this.filteredSupplies.length;
    this.currentPage = 1;
  }

  get paginatedSupplies(): SupplyBase[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredSupplies.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.supplyForm.patchValue({ Image: file });
    }
  }

  onImageFileSelected(event: any, supply: SupplyBase): void {
    const file = event.target.files[0];
    if (file) {
      this.updateSupplyImage(supply, file);
    }
  }

  onSubmit(): void {
    if (this.supplyForm.invalid) {
      this.markFormGroupTouched(this.supplyForm);
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    // Crear el DTO
    const dto = this.buildDto();
    
    // Convertir a FormData
    const formData = this.buildFormDataFromDto(dto);

    let submitObservable;
    switch (this.currentTab) {
      case TypeSupply.Profile:
        submitObservable = this.insumosService.addProfile(formData);
        break;
      case TypeSupply.Glass:
        submitObservable = this.insumosService.addGlass(formData);
        break;
      case TypeSupply.Accessory:
        submitObservable = this.insumosService.addAccessory(formData);
        break;
      default:
        this.isLoading = false;
        return;
    }

    submitObservable.subscribe({
      next: (response) => {
        this.successMessage = `${this.typeLabels[this.currentTab]} creado exitosamente`;
        
        // Optimistic UI update - add to cache
        const newSupply: SupplyBase = {
          codeSupply: dto.codeSupply,
          nameSupply: dto.nameSupply,
          descriptionSupply: dto.descriptionSupply,
          nameSupplier: dto.nameSupplier,
          priceSupply: dto.priceSupply,
          imageUrl: undefined // Will be updated if backend returns URL
        };
        
        this.insumosService.addSupplyToCache(newSupply, this.currentTab);
        this.resetForm();
        this.addPanelCollapsed = true; // Auto-collapse after successful add
        this.isLoading = false;
        setTimeout(() => this.clearMessages(), 5000);
      },
      error: (error) => {
        this.errorMessage = this.extractErrorMessage(error);
        this.isLoading = false;
        setTimeout(() => this.clearMessages(), 5000);
      }
    });
  }

  private buildDto(): any {
    const formValues = this.supplyForm.value;
    
    // Crear el DTO base
    const dto: any = {
      codeSupply: formValues.codeSupply,
      nameSupply: formValues.nameSupply, 
      descriptionSupply: formValues.descriptionSupply,
      nameSupplier: formValues.nameSupplier,
      priceSupply: formValues.priceSupply
    };

    // Agregar campos específicos según el tipo
    switch (this.currentTab) {
      case TypeSupply.Profile:
        dto.profileWeigth = formValues.profileWeigth || 0;
        dto.profileHeigth = formValues.profileHeigth || 0;
        dto.weigthMetro = formValues.weigthMetro || 0;
        dto.profileColor = formValues.profileColor || '';
        break;
        
      case TypeSupply.Glass:
        dto.glassThickness = formValues.glassThickness || 0;
        dto.glassLength = formValues.glassLength || 0;
        dto.glassWidth = formValues.glassWidth || 0;
        dto.glassType = formValues.glassType || GlassType.Float;
        break;
        
      case TypeSupply.Accessory:
        dto.descriptionAccessory = formValues.descriptionAccessory || '';
        break;
    }

    return dto;
  }

  private buildFormDataFromDto(dto: any): FormData {
    const formData = new FormData();
    
    // Agregar todos los campos del DTO
    Object.keys(dto).forEach(key => {
      if (dto[key] !== null && dto[key] !== undefined) {
        formData.append(key, dto[key].toString());
      }
    });
    
    // Agregar el archivo si existe
    if (this.selectedFile) {
      formData.append('Image', this.selectedFile);
    }
    
    return formData;
  }

  openEditPrice(supply: SupplyBase): void {
    this.editingSupply = supply;
    this.editPriceForm.patchValue({ priceSupply: supply.priceSupply });
    this.showEditPriceModal = true;
  }

  openEditDescription(supply: SupplyBase): void {
    this.editingSupply = supply;
    this.editDescriptionForm.patchValue({ descriptionSupply: supply.descriptionSupply });
    this.showEditDescriptionModal = true;
  }

  onEditPrice(): void {
    if (this.editPriceForm.invalid || !this.editingSupply) {
      return;
    }

    this.setRowLoading(this.editingSupply.codeSupply, true);
    this.clearMessages();
    
    // Robust number conversion
    const priceInput = this.editPriceForm.value.priceSupply.toString().trim();
    const normalizedPrice = priceInput.replace(',', '.'); // Handle comma decimal separator
    const numericPrice = Number(normalizedPrice);
    
    if (isNaN(numericPrice) || numericPrice <= 0) {
      this.errorMessage = 'El precio debe ser un número válido mayor a 0';
      this.setRowLoading(this.editingSupply.codeSupply, false);
      setTimeout(() => this.clearMessages(), 5000);
      return;
    }
    
    const payload: EditPriceSupplyDto = {
      codeSupply: this.editingSupply.codeSupply,
      type: this.insumosService.getTypeAsBackend(this.currentTab),
      newPriceSupply: numericPrice
    };

    this.insumosService.updatePrice(payload).subscribe({
      next: () => {
        const currentSupplyCode = payload.codeSupply;
        
        // Optimistic UI update
        const updatedSupply = {
          ...this.editingSupply!,
          priceSupply: payload.newPriceSupply
        };
        this.insumosService.updateSupplyInCache(updatedSupply, this.currentTab);
        
        // Clear loading state first
        this.setRowLoading(currentSupplyCode, false);
        
        // Close modal
        this.closeEditPriceModal();
        
        // Show success message
        this.successMessage = 'Precio actualizado exitosamente';
        setTimeout(() => this.clearMessages(), 5000);
      },
      error: (error) => {
        const currentSupplyCode = payload.codeSupply;
        this.errorMessage = this.extractErrorMessage(error);
        this.setRowLoading(currentSupplyCode, false);
        // Keep modal open on error
        setTimeout(() => this.clearMessages(), 5000);
      }
    });
  }

  onEditDescription(): void {
    if (this.editDescriptionForm.invalid || !this.editingSupply) {
      return;
    }

    this.setRowLoading(this.editingSupply.codeSupply, true);
    const payload: EditSupplyDto = {
      codeSupply: this.editingSupply.codeSupply,
      type: this.insumosService.getTypeAsBackend(this.currentTab),
      description: this.editDescriptionForm.value.descriptionSupply
    };

    this.insumosService.updateDescription(payload).subscribe({
      next: () => {
        const currentSupplyCode = payload.codeSupply;
        
        // Optimistic UI update
        const updatedSupply = {
          ...this.editingSupply!,
          descriptionSupply: payload.description
        };
        this.insumosService.updateSupplyInCache(updatedSupply, this.currentTab);
        
        // Clear loading state first
        this.setRowLoading(currentSupplyCode, false);
        
        // Close modal
        this.closeEditDescriptionModal();
        
        // Show success message
        this.successMessage = 'Descripción actualizada exitosamente';
        setTimeout(() => this.clearMessages(), 5000);
      },
      error: (error) => {
        const currentSupplyCode = payload.codeSupply;
        this.errorMessage = this.extractErrorMessage(error);
        this.setRowLoading(currentSupplyCode, false);
        setTimeout(() => this.clearMessages(), 5000);
      }
    });
  }

  private updateSupplyImage(supply: SupplyBase, file: File): void {
    this.setRowLoading(supply.codeSupply, true);
    const formData = new FormData();
    formData.append('codeSupply', supply.codeSupply);
    formData.append('type', this.insumosService.getTypeAsBackend(this.currentTab).toString());
    formData.append('Image', file);

    this.insumosService.updateImage(formData).subscribe({
      next: (response: any) => {
        this.successMessage = 'Imagen actualizada exitosamente';
        
        // Check if backend returned new image URL
        if (response && response.imageUrl) {
          // Optimistic UI update with new URL
          const updatedSupply = {
            ...supply,
            imageUrl: response.imageUrl
          };
          this.insumosService.updateSupplyInCache(updatedSupply, this.currentTab);
          this.setRowLoading(supply.codeSupply, false);
        } else {
          // No URL returned, refresh the current tab to get updated data
          this.setRowLoading(supply.codeSupply, false);
          this.refreshCurrentTab();
        }
        
        setTimeout(() => this.clearMessages(), 5000);
      },
      error: (error) => {
        this.errorMessage = this.extractErrorMessage(error);
        this.setRowLoading(supply.codeSupply, false);
        setTimeout(() => this.clearMessages(), 5000);
      }
    });
  }

  deleteSupply(supply: SupplyBase): void {
    if (!confirm(`¿Está seguro de eliminar el insumo ${supply.codeSupply}?`)) {
      return;
    }

    this.setRowLoading(supply.codeSupply, true);
    const payload: DeleteSupplyDto = {
      codeSupply: supply.codeSupply,
      type: this.insumosService.getTypeAsBackend(this.currentTab)
    };

    this.insumosService.deleteSupply(payload).subscribe({
      next: () => {
        const currentSupplyCode = payload.codeSupply;
        
        // Optimistic UI update - remove from cache
        this.insumosService.removeSupplyFromCache(currentSupplyCode, this.currentTab);
        
        // Clear loading state
        this.setRowLoading(currentSupplyCode, false);
        
        // Show success message
        this.successMessage = 'Insumo eliminado exitosamente';
        setTimeout(() => this.clearMessages(), 5000);
      },
      error: (error) => {
        const currentSupplyCode = payload.codeSupply;
        this.errorMessage = this.extractErrorMessage(error);
        this.setRowLoading(currentSupplyCode, false);
        setTimeout(() => this.clearMessages(), 5000);
      }
    });
  }

  closeEditPriceModal(): void {
    this.showEditPriceModal = false;
    this.editingSupply = null;
    this.editPriceForm.reset();
  }

  closeEditDescriptionModal(): void {
    this.showEditDescriptionModal = false;
    this.editingSupply = null;
    this.editDescriptionForm.reset();
  }


  private resetForm(): void {
    this.supplyForm.reset();
    this.selectedFile = null;
    this.supplyForm.patchValue({
      priceSupply: 0,
      profileWeigth: 0,
      profileHeigth: 0,
      weigthMetro: 0,
      glassThickness: 0,
      glassLength: 0,
      glassWidth: 0,
      glassType: GlassType.Float
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private extractErrorMessage(error: any): string {
    if (error.error && error.error.message) {
      return error.error.message;
    }
    if (error.error && error.error.mensaje) {
      return error.error.mensaje;
    }
    if (error.message) {
      return error.message;
    }
    return 'Ha ocurrido un error inesperado';
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  private saveFiltersToStorage(): void {
    const filters = {
      currentTab: this.currentTab,
      searchQuery: this.searchQuery,
      currentPage: this.currentPage
    };
    localStorage.setItem('insumos_filters', JSON.stringify(filters));
  }

  private restoreFiltersFromStorage(): void {
    const stored = localStorage.getItem('insumos_filters');
    if (stored) {
      try {
        const filters = JSON.parse(stored);
        this.currentTab = filters.currentTab || TypeSupply.Profile;
        this.searchQuery = filters.searchQuery || '';
        this.currentPage = filters.currentPage || 1;
      } catch (error) {
        console.warn('Error restoring filters:', error);
      }
    }
  }

  isFieldInvalid(fieldName: string, form?: FormGroup): boolean {
    const targetForm = form || this.supplyForm;
    const field = targetForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string, form?: FormGroup): string {
    const targetForm = form || this.supplyForm;
    const field = targetForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['min']) return `El valor mínimo es ${field.errors['min'].min}`;
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    }
    return '';
  }

  volverAlDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  getProfileProperty(supply: SupplyBase, property: string): string {
    if (this.currentTab === TypeSupply.Profile && (supply as any)[property] !== undefined) {
      return (supply as any)[property];
    }
    return '-';
  }

  getGlassProperty(supply: SupplyBase, property: string): string {
    if (this.currentTab === TypeSupply.Glass && (supply as any)[property] !== undefined) {
      if (property === 'glassType') {
        const glassType = (supply as any)[property] as GlassType;
        return this.GlassTypeLabels[glassType] || glassType.toString();
      }
      return (supply as any)[property];
    }
    return '-';
  }

  // New required methods
  private loadAllSupplies(): void {
    this.isLoading = true;
    this.insumosService.getAllSupplies().subscribe({
      next: (supplies) => {
        this.all = supplies;
        this.isLoading = false;
        // Caches are updated automatically by the service
      },
      error: (error) => {
        console.error('Error loading supplies:', error);
        this.errorMessage = this.extractErrorMessage(error);
        this.isLoading = false;
        setTimeout(() => this.clearMessages(), 5000);
      }
    });
  }

  private updateCurrentTabData(): void {
    let currentSupplies: SupplyBase[] = [];
    
    switch (this.currentTab) {
      case TypeSupply.Profile:
        currentSupplies = this.profiles;
        break;
      case TypeSupply.Glass:
        currentSupplies = this.glasses;
        break;
      case TypeSupply.Accessory:
        currentSupplies = this.accessories;
        break;
    }

    this.filteredSupplies = currentSupplies;
    this.total = currentSupplies.length;
    this.applySearch();
  }

  toggleAddPanel(): void {
    this.addPanelCollapsed = !this.addPanelCollapsed;
    this.saveStateToStorage();
  }

  limpiarFormulario(): void {
    this.resetForm();
  }

  isRowLoading(codeSupply: string): boolean {
    return this.rowLoadingStates[codeSupply] || false;
  }

  private setRowLoading(codeSupply: string, loading: boolean): void {
    if (loading) {
      this.rowLoadingStates[codeSupply] = true;
    } else {
      delete this.rowLoadingStates[codeSupply];
    }
  }

  private saveStateToStorage(): void {
    const state = {
      currentTab: this.currentTab,
      addPanelCollapsed: this.addPanelCollapsed,
      searchQuery: this.searchQuery,
      currentPage: this.currentPage
    };
    localStorage.setItem('insumos_state', JSON.stringify(state));
  }

  private restoreStateFromStorage(): void {
    const stored = localStorage.getItem('insumos_state');
    if (stored) {
      try {
        const state = JSON.parse(stored);
        this.currentTab = state.currentTab || TypeSupply.Profile;
        this.addPanelCollapsed = state.addPanelCollapsed || false;
        this.searchQuery = state.searchQuery || '';
        this.currentPage = state.currentPage || 1;
      } catch (error) {
        console.warn('Error restoring state:', error);
      }
    }
  }

  // Refresh methods
  refreshAllSupplies(): void {
    this.isRefreshingAll = true;
    this.clearMessages();
    
    this.insumosService.getAllSupplies().subscribe({
      next: (supplies) => {
        this.all = supplies;
        this.successMessage = 'Todos los insumos actualizados';
        this.isRefreshingAll = false;
        setTimeout(() => this.clearMessages(), 3000);
      },
      error: (error) => {
        this.errorMessage = this.extractErrorMessage(error);
        this.isRefreshingAll = false;
        setTimeout(() => this.clearMessages(), 5000);
      }
    });
  }

  refreshCurrentTab(): void {
    this.isRefreshingTab = true;
    this.clearMessages();
    
    const typeValue = this.insumosService.getTypeAsBackend(this.currentTab);
    
    this.insumosService.getByType(typeValue).subscribe({
      next: () => {
        this.successMessage = `${this.typePlurals[this.currentTab]} actualizados`;
        this.isRefreshingTab = false;
        setTimeout(() => this.clearMessages(), 3000);
      },
      error: (error) => {
        this.errorMessage = this.extractErrorMessage(error);
        this.isRefreshingTab = false;
        setTimeout(() => this.clearMessages(), 5000);
      }
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applySearch();
    this.saveStateToStorage();
  }

  onSearchInput(): void {
    this.onSearch();
    this.saveStateToStorage();
  }
}