import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataTableComponent, DataTableColumn } from '../data-table/data-table.component';
import { CommonService } from '../../services/common.service';
import { Product, ProductDto, UpdateDescriptionProductDto, Supply, ProductMovement } from '../../models/product.interfaces';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DataTableComponent],
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss']
})
export class ProductsListComponent implements OnInit {
  searchText: string = '';
  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedProduct: Product | null = null;
  supplies: Supply[] = [];
  movements: ProductMovement[] = [];

  // UI States
  loading = false;
  error: string | null = null;
  success: string | null = null;
  showCreateForm = false;
  showEditForm = false;
  showSupplies = false;
  showMovements = false;

  // Forms
  createProductForm: FormGroup;
  editDescriptionForm: FormGroup;

  columns: DataTableColumn[] = [
    { key: 'codeProduct', label: 'Código' },
    { key: 'name', label: 'Nombre' },
    { key: 'description', label: 'Descripción' },
    { key: 'price', label: 'Precio' },
    { key: 'category', label: 'Categoría' },
    { key: 'stock', label: 'Stock' }
  ];

  constructor(
    private commonService: CommonService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.createProductForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      codeProduct: ['', Validators.required],
      image: [null]
    });

    this.editDescriptionForm = this.formBuilder.group({
      description: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.error = null;

    this.commonService.obtenerProductos().subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = [...data];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.error = typeof error === 'string' ? error : 'Error al cargar productos';
        this.loading = false;

        // Load test data when API fails
        this.products = [
          {
            codeProduct: 'PROD001',
            name: 'Notebook Dell Inspiron 15',
            description: 'Notebook para uso profesional',
            price: 785000.00,
            category: 'Informática',
            stock: 12
          },
          {
            codeProduct: 'PROD002',
            name: 'Smartphone Samsung Galaxy A54',
            description: 'Smartphone con cámara avanzada',
            price: 320000.00,
            category: 'Telefonía',
            stock: 25
          }
        ];
        this.filteredProducts = [...this.products];
      }
    });
  }

  onSearch() {
    if (!this.searchText.trim()) {
      this.filteredProducts = [...this.products];
      return;
    }

    const searchLower = this.searchText.toLowerCase();
    this.filteredProducts = this.products.filter(product =>
      Object.values(product).some(value =>
        String(value).toLowerCase().includes(searchLower)
      )
    );
  }

  onClearSearch() {
    this.searchText = '';
    this.filteredProducts = [...this.products];
  }

  // CRUD Operations
  onCreateProduct() {
    if (this.createProductForm.valid) {
      this.loading = true;
      this.error = null;

      const formData = new FormData();
      const formValue = this.createProductForm.value;

      formData.append('name', formValue.name);
      formData.append('description', formValue.description);
      formData.append('price', formValue.price.toString());
      formData.append('category', formValue.category);
      formData.append('codeProduct', formValue.codeProduct);

      if (formValue.image) {
        formData.append('image', formValue.image);
      }

      this.commonService.crearProducto(formData).subscribe({
        next: () => {
          this.success = 'Producto creado correctamente';
          this.loading = false;
          this.showCreateForm = false;
          this.createProductForm.reset();
          this.loadProducts();
        },
        error: (error) => {
          this.error = typeof error === 'string' ? error : 'Error al crear producto';
          this.loading = false;
        }
      });
    }
  }

  onUpdateDescription() {
    if (this.editDescriptionForm.valid && this.selectedProduct) {
      this.loading = true;
      this.error = null;

      const payload: UpdateDescriptionProductDto = {
        codeProduct: this.selectedProduct.codeProduct,
        description: this.editDescriptionForm.value.description
      };

      this.commonService.actualizarDescripcionProducto(payload).subscribe({
        next: () => {
          this.success = 'Descripción actualizada correctamente';
          this.loading = false;
          this.showEditForm = false;
          this.loadProducts();
        },
        error: (error) => {
          this.error = typeof error === 'string' ? error : 'Error al actualizar descripción';
          this.loading = false;
        }
      });
    }
  }

  onUpdateImage(event: any) {
    const file = event.target.files[0];
    if (file && this.selectedProduct) {
      this.loading = true;
      this.error = null;

      const formData = new FormData();
      formData.append('codeProduct', this.selectedProduct.codeProduct);
      formData.append('image', file);

      this.commonService.actualizarImagenProducto(formData).subscribe({
        next: () => {
          this.success = 'Imagen actualizada correctamente';
          this.loading = false;
          this.loadProducts();
        },
        error: (error) => {
          this.error = typeof error === 'string' ? error : 'Error al actualizar imagen';
          this.loading = false;
        }
      });
    }
  }

  onDeleteProduct(codeProduct: string) {
    if (confirm('¿Está seguro de eliminar este producto?')) {
      this.loading = true;
      this.error = null;

      this.commonService.eliminarProducto(codeProduct).subscribe({
        next: () => {
          this.success = 'Producto eliminado correctamente';
          this.loading = false;
          this.loadProducts();
        },
        error: (error) => {
          this.error = typeof error === 'string' ? error : 'Error al eliminar producto';
          this.loading = false;
        }
      });
    }
  }

  onViewSupplies(product: Product) {
    this.selectedProduct = product;
    this.loading = true;
    this.error = null;

    this.commonService.obtenerInsumosDelProducto(product.codeProduct).subscribe({
      next: (supplies) => {
        this.supplies = supplies;
        this.showSupplies = true;
        this.loading = false;
      },
      error: (error) => {
        this.error = typeof error === 'string' ? error : 'Error al cargar insumos';
        this.loading = false;
      }
    });
  }

  onViewMovements() {
    this.loading = true;
    this.error = null;

    this.commonService.obtenerMovimientos().subscribe({
      next: (movements) => {
        this.movements = movements;
        this.showMovements = true;
        this.loading = false;
      },
      error: (error) => {
        this.error = typeof error === 'string' ? error : 'Error al cargar movimientos';
        this.loading = false;
      }
    });
  }

  // UI helpers
  onSelectProduct(product: Product) {
    this.selectedProduct = product;
    this.editDescriptionForm.patchValue({ description: product.description });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.createProductForm.patchValue({ image: file });
    }
  }

  clearMessages() {
    this.error = null;
    this.success = null;
  }

  volverAlDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
