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
  query: string = '';
  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedProduct: Product | null = null;
  supplies: Supply[] = [];
  movements: ProductMovement[] = [];

  // UI States
  loading = false;
  isLoading = false;
  hasError = false;
  errorMsg: string | null = null;
  error: string | null = null;
  success: string | null = null;
  showCreateForm = false;
  showEditForm = false;
  showSupplies = false;
  showMovements = false;

  // Pagination
  pageIndex = 0;
  pageSize = 10;
  total = 0;

  // Forms
  createProductForm: FormGroup;
  editDescriptionForm: FormGroup;

  Math = Math;

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
    this.isLoading = true;
    this.error = null;

    this.commonService.obtenerProductos().subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = [...data];
        this.total = data.length;
        this.loading = false;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.error = typeof error === 'string' ? error : 'Error al cargar productos';
        this.loading = false;
        this.isLoading = false;

        // Load test data when API fails
        this.products = [
          {
            codeProduct: 'PROD001',
            name: 'Notebook Dell Inspiron 15',
            description: 'Notebook para uso profesional con procesador Intel Core i5, 8GB RAM y disco SSD de 256GB',
            price: 785000.00,
            category: 'Informática',
            stock: 12
          },
          {
            codeProduct: 'PROD002',
            name: 'Smartphone Samsung Galaxy A54',
            description: 'Smartphone con cámara avanzada de 50MP, pantalla AMOLED de 6.4 pulgadas y batería de 5000mAh',
            price: 320000.00,
            category: 'Telefonía',
            stock: 25
          }
        ];
        this.filteredProducts = [...this.products];
        this.total = this.products.length;
      }
    });
  }

  buscar() {
    if (!this.query.trim()) {
      this.filteredProducts = [...this.products];
      this.total = this.products.length;
      this.pageIndex = 0;
      return;
    }

    const searchLower = this.query.toLowerCase();
    this.filteredProducts = this.products.filter(product =>
      Object.values(product).some(value =>
        String(value).toLowerCase().includes(searchLower)
      )
    );
    this.total = this.filteredProducts.length;
    this.pageIndex = 0;
  }

  limpiar() {
    this.query = '';
    this.filteredProducts = [...this.products];
    this.total = this.products.length;
    this.pageIndex = 0;
  }

  onEditar(item: Product) {
    this.selectedProduct = item;
    this.editDescriptionForm.patchValue({ description: item.description });
    this.showEditForm = true;
  }

  onVerInsumos(item: Product) {
    this.selectedProduct = item;
    this.loading = true;
    this.error = null;

    this.commonService.obtenerInsumosDelProducto(item.codeProduct).subscribe({
      next: (supplies) => {
        this.supplies = supplies;
        this.showSupplies = true;
        this.loading = false;
      },
      error: (error) => {
        this.error = typeof error === 'string' ? error : 'Error al cargar insumos';
        this.loading = false;
        // TODO: Handle supplies endpoint when available
        this.supplies = [];
        this.showSupplies = true;
      }
    });
  }

  onCambiarImagen(item: Product) {
    this.selectedProduct = item;
    const fileInput = document.querySelector('#imageInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    } else {
      // Fallback: create temporary input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (event: any) => this.onUpdateImage(event);
      input.click();
    }
  }

  onEliminar(item: Product) {
    if (window.confirm(`¿Está seguro de eliminar el producto "${item.name}"?`)) {
      this.loading = true;
      this.error = null;

      const codigo = item.codeProduct;
      this.commonService.eliminarProducto(codigo).subscribe({
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

  // Pagination methods
  previousPage() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      // TODO: Implement server-side pagination when available
    }
  }

  nextPage() {
    if ((this.pageIndex + 1) * this.pageSize < this.total) {
      this.pageIndex++;
      // TODO: Implement server-side pagination when available
    }
  }

  // Keep existing methods for backward compatibility
  get searchText() {
    return this.query;
  }

  set searchText(value: string) {
    this.query = value;
  }

  onSearch() {
    this.buscar();
  }

  onClearSearch() {
    this.limpiar();
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
    this.onVerInsumos(product);
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
