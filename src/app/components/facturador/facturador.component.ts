import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { 
  Factura, 
  Sucursal, 
  Tipo, 
  Moneda, 
  Contacto, 
  ArticuloFactura, 
  Presupuesto,
  ArticuloInfo 
} from './facturador.interfaces';

@Component({
  selector: 'app-facturador',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './facturador.component.html',
  styleUrls: ['./facturador.component.scss']
})
export class FacturadorComponent implements OnInit {
  facturadorForm: FormGroup;
  facturaGenerada: Factura | null = null;
  presupuestosSeleccionados: Presupuesto[] = [];
  articulosSeleccionados: ArticuloFactura[] = [];

  sucursales: Sucursal[] = [
    { Id: 1, Nombre: 'Sucursal Centro' },
    { Id: 2, Nombre: 'Sucursal Norte' },
    { Id: 3, Nombre: 'Sucursal Sur' }
  ];

  tipos: Tipo[] = [
    { Id: 1, Nombre: 'Factura' },
    { Id: 2, Nombre: 'Boleta' },
    { Id: 3, Nombre: 'Nota de Crédito' }
  ];

  monedas: Moneda[] = [
    { CurrencyCode: 'UYU', Nombre: 'Peso Uruguayo' },
    { CurrencyCode: 'USD', Nombre: 'Dólar Americano' },
    { CurrencyCode: 'EUR', Nombre: 'Euro' }
  ];

  contactos: Contacto[] = [
    {
      TipoEnte: 1,
      Identificador1: { Value: '201234560019' },
      Nombre1: { Value: 'Cliente SA' },
      Direcciones: [{
        Tipo: { Id: 1, Nombre: 'Comercial' },
        Ciudad: {
          ID: 100,
          Nombre: 'Montevideo',
          Estado: {
            ID: 1,
            Nombre: 'Montevideo',
            Pais: { ID: 1, Nombre: 'Uruguay' }
          }
        },
        Domicilio: 'Av. Principal 1234'
      }]
    },
    {
      TipoEnte: 1,
      Identificador1: { Value: '201234560020' },
      Nombre1: { Value: 'Empresa XYZ' },
      Direcciones: [{
        Tipo: { Id: 1, Nombre: 'Comercial' },
        Ciudad: {
          ID: 101,
          Nombre: 'Canelones',
          Estado: {
            ID: 2,
            Nombre: 'Canelones',
            Pais: { ID: 1, Nombre: 'Uruguay' }
          }
        },
        Domicilio: 'Calle Secundaria 567'
      }]
    }
  ];

  presupuestos: Presupuesto[] = [
    {
      Id: 1,
      Fecha: '2025-07-15',
      Cliente: 'Cliente SA',
      Articulos: [
        {
          Articulo: { Codigo: 'A001', Nombre: 'Producto A' },
          Cantidad: 2,
          PrecioUnitario: 100
        },
        {
          Articulo: { Codigo: 'A002', Nombre: 'Producto B' },
          Cantidad: 1,
          PrecioUnitario: 200
        }
      ],
      Total: 400
    },
    {
      Id: 2,
      Fecha: '2025-07-20',
      Cliente: 'Empresa XYZ',
      Articulos: [
        {
          Articulo: { Codigo: 'A003', Nombre: 'Producto C' },
          Cantidad: 3,
          PrecioUnitario: 150
        }
      ],
      Total: 450
    }
  ];

  articulos: ArticuloInfo[] = [
    { Codigo: 'A001', Nombre: 'Producto A' },
    { Codigo: 'A002', Nombre: 'Producto B' },
    { Codigo: 'A003', Nombre: 'Producto C' },
    { Codigo: 'A004', Nombre: 'Producto D' }
  ];

  constructor(private fb: FormBuilder) {
    this.facturadorForm = this.fb.group({
      fecha: [this.getTodayDate(), Validators.required],
      sucursal: ['', Validators.required],
      tipo: ['', Validators.required],
      moneda: ['', Validators.required],
      contacto: ['', Validators.required],
      presupuesto: [''],
      articulo: [''],
      cantidadArticulo: [1, [Validators.required, Validators.min(1)]],
      precioUnitarioArticulo: [0, [Validators.min(0.01)]],
      precioFinal: [0, [Validators.required, Validators.min(0.01)]],
      comentario: [''],
      vendedor: ['Juan Pérez', Validators.required]
    });
  }

  ngOnInit() {
    this.calcularPrecioFinal();
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  agregarPresupuesto() {
    const presupuestoId = this.facturadorForm.get('presupuesto')?.value;
    if (presupuestoId) {
      const presupuesto = this.presupuestos.find(p => p.Id === parseInt(presupuestoId));
      if (presupuesto && !this.presupuestosSeleccionados.find(p => p.Id === presupuesto.Id)) {
        this.presupuestosSeleccionados.push(presupuesto);
        this.facturadorForm.patchValue({ presupuesto: '' });
        this.calcularPrecioFinal();
      }
    }
  }

  agregarArticulo() {
    const articuloId = this.facturadorForm.get('articulo')?.value;
    const cantidad = this.facturadorForm.get('cantidadArticulo')?.value;
    const precioUnitario = this.facturadorForm.get('precioUnitarioArticulo')?.value;
    
    if (articuloId && cantidad && precioUnitario) {
      const articuloInfo = this.articulos.find(a => a.Codigo === articuloId);
      if (articuloInfo) {
        const nuevoArticulo: ArticuloFactura = {
          Articulo: articuloInfo,
          Cantidad: cantidad,
          PrecioUnitario: precioUnitario
        };
        this.articulosSeleccionados.push(nuevoArticulo);
        this.facturadorForm.patchValue({ 
          articulo: '',
          cantidadArticulo: 1,
          precioUnitarioArticulo: 0
        });
        this.calcularPrecioFinal();
      }
    }
  }

  eliminarPresupuesto(index: number) {
    this.presupuestosSeleccionados.splice(index, 1);
    this.calcularPrecioFinal();
  }

  eliminarArticulo(index: number) {
    this.articulosSeleccionados.splice(index, 1);
    this.calcularPrecioFinal();
  }

  calcularPrecioFinal() {
    let total = 0;
    
    // Sumar presupuestos
    this.presupuestosSeleccionados.forEach(presupuesto => {
      total += presupuesto.Total;
    });
    
    // Sumar artículos individuales
    this.articulosSeleccionados.forEach(articulo => {
      total += articulo.Cantidad * articulo.PrecioUnitario;
    });
    
    this.facturadorForm.patchValue({ precioFinal: total });
  }

  onSubmit() {
    if (this.facturadorForm.valid) {
      this.generarFactura();
    } else {
      this.marcarCamposComoTocados();
    }
  }

  private generarFactura() {
    const formValues = this.facturadorForm.value;
    
    const sucursal = this.sucursales.find(s => s.Id === parseInt(formValues.sucursal));
    const tipo = this.tipos.find(t => t.Id === parseInt(formValues.tipo));
    const moneda = this.monedas.find(m => m.CurrencyCode === formValues.moneda);
    const contacto = this.contactos.find(c => c.Identificador1.Value === formValues.contacto);
    
    let articulos: ArticuloFactura[] = [];
    
    // Agregar artículos de presupuestos seleccionados
    this.presupuestosSeleccionados.forEach(presupuesto => {
      articulos = [...articulos, ...presupuesto.Articulos];
    });
    
    // Agregar artículos individuales seleccionados
    articulos = [...articulos, ...this.articulosSeleccionados];

    this.facturaGenerada = {
      Fecha: formValues.fecha,
      Empresa: 'MiEmpresaSA',
      Sucursal: sucursal!,
      Tipo: tipo!,
      Moneda: moneda!,
      Contacto: contacto!,
      Vendedor: formValues.vendedor,
      Articulos: articulos,
      ImporteTotal: formValues.precioFinal,
      TipoCambio: 1,
      Comentario: formValues.comentario || '',
      PorcentajeDescuentoGlobal: 0,
      Financiacion: {
        ProximoVencimiento: this.getNextMonth()
      }
    };

    console.log('Factura generada:', this.facturaGenerada);
  }

  private getNextMonth(): string {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().split('T')[0];
  }

  private marcarCamposComoTocados() {
    Object.keys(this.facturadorForm.controls).forEach(key => {
      this.facturadorForm.get(key)?.markAsTouched();
    });
  }

  cancelar() {
    this.facturadorForm.reset({
      fecha: this.getTodayDate(),
      vendedor: 'Juan Pérez',
      cantidadArticulo: 1,
      precioUnitarioArticulo: 0,
      precioFinal: 0
    });
    this.presupuestosSeleccionados = [];
    this.articulosSeleccionados = [];
    this.facturaGenerada = null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.facturadorForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  puedeAgregarPresupuesto(): boolean {
    return !!this.facturadorForm.get('presupuesto')?.value;
  }

  puedeAgregarArticulo(): boolean {
    const articulo = this.facturadorForm.get('articulo')?.value;
    const cantidad = this.facturadorForm.get('cantidadArticulo')?.value;
    const precio = this.facturadorForm.get('precioUnitarioArticulo')?.value;
    return !!(articulo && cantidad && precio);
  }
}