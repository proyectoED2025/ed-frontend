import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataTableComponent, DataTableColumn } from '../data-table/data-table.component';
import { CommonService } from '../../services/common.service';
import { Product, ProductDto, ProductType, SupplyNecessaryDto, UpdateDescriptionProductDto, Supply, ProductMovement } from '../../models/product.interfaces';

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

  // Insumos/Supplies management
  productSupplies: SupplyNecessaryDto[] = [];

  // Enum references
  readonly ProductType = ProductType;
  readonly productTypeOptions = [
    { value: ProductType.Ventana, label: 'Ventana' },
    { value: ProductType.Puerta, label: 'Puerta' },
    { value: ProductType.Mampara, label: 'Mampara' },
    { value: ProductType.Batiente, label: 'Batiente' },
    { value: ProductType.Tabaquera, label: 'Tabaquera' },
    { value: ProductType.Proyectante, label: 'Proyectante' },
    { value: ProductType.Fijo, label: 'Fijo' }
  ];

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
      codeProduct: ['', Validators.required],
      productName: ['', Validators.required],
      productDescription: ['', Validators.required],
      productCategory: [ProductType.Ventana, Validators.required],
      productPrice: [0, [Validators.required, Validators.min(0.01)]],
      image: [null],
      imageUrl: ['']
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
      this.products = data.map((dto: ProductDto): Product => {
        return {
          codeProduct: dto.codeProduct,
          name: dto.productName,
          description: dto.productDescription,
          price: dto.productPrice,
          category: typeof dto.productCategory === 'number' ? ProductType[dto.productCategory] : dto.productCategory,
          imageUrl: dto.imageUrl ?? undefined,
          stock: dto.supplies?.length ?? 0
        };
      });
        this.filteredProducts = [...this.products];
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
        this.products = [];
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

  // Supply management methods
  addSupplyRow() {
    this.productSupplies.push({ codeSupply: '', quantity: 1 });
  }

  removeSupplyRow(index: number) {
    this.productSupplies.splice(index, 1);
  }

  isSupplyValid(supply: SupplyNecessaryDto): boolean {
    return supply.codeSupply.trim() !== '' && supply.quantity > 0;
  }

  // CRUD Operations
  onCreateProduct() {
    if (this.createProductForm.valid) {
      this.loading = true;
      this.error = null;

      const formValue = this.createProductForm.value;

      // Build ProductDto according to backend specification
      const productDto: ProductDto = {
        codeProduct: formValue.codeProduct,
        productName: formValue.productName,
        productDescription: formValue.productDescription,
        productCategory: Number(formValue.productCategory),
        productPrice: Number(formValue.productPrice),
        Image: formValue.image || null,
        imageUrl: formValue.imageUrl?.trim() || null,
        supplies: this.productSupplies.filter(s => this.isSupplyValid(s))
      };

      // Convert to FormData for file upload
      const formData = new FormData();
      formData.append('codeProduct', productDto.codeProduct);
      formData.append('productName', productDto.productName);
      formData.append('productDescription', productDto.productDescription);
      formData.append('productCategory', productDto.productCategory.toString());
      formData.append('productPrice', productDto.productPrice.toString());

      if (productDto.Image) {
        formData.append('Image', productDto.Image);
      }

      if (productDto.imageUrl) {
        formData.append('imageUrl', productDto.imageUrl);
      }

      // Add supplies as JSON string or individual entries
      formData.append('supplies', JSON.stringify(productDto.supplies));

      this.commonService.crearProducto(formData).subscribe({
        next: () => {
          this.success = 'Producto creado correctamente';
          this.loading = false;
          this.showCreateForm = false;
          this.resetCreateForm();
          this.loadProducts();
        },
        error: (error) => {
          this.error = typeof error === 'string' ? error : 'Error al crear producto';
          this.loading = false;
        }
      });
    }
  }

  public resetCreateForm() {
    this.createProductForm.reset();
    this.createProductForm.patchValue({
      productCategory: ProductType.Ventana,
      productPrice: 0
    });
    this.productSupplies = [];
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
