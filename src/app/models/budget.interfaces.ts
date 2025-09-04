export interface CustomerDto {
  CustomerId: number;
  Nombre: string;
  Identificador: string;
  TipoDocumento: string;
  Email: string;
  Telefono: string;
  DireccionFiscal: string;
}

export interface ProductBudgetDto {
  Name: string;
  Width: number;
  Heigth: number;
  Color: string;
  amount: number;
  GlassThickness: string;
  GlassType: number;  // Cambiado a number para el enum
  TypeProduct: number;  // Cambiado a number para el enum
  Serie: number;  // Cambiado a number para el enum
}

export interface BudgetCreateDto {
  Cliente: CustomerDto;
  Productos: ProductBudgetDto[];
}

export interface BudgetItem extends ProductBudgetDto {
  id?: string;
  isValid?: boolean;
  subtotal?: number;
}

// Enums del backend con sus valores numéricos exactos
export const GLASS_TYPES = [
  { value: 1, label: 'Float' },
  { value: 2, label: 'Templado' },
  { value: 3, label: 'Laminado' },
  { value: 4, label: 'Doble Acristalamiento' },
  { value: 5, label: 'Bajo Emisivo' },
  { value: 6, label: 'Reflectivo' },
  { value: 7, label: 'Mateado' },
  { value: 8, label: 'Decorativo' }
];

export const PRODUCT_TYPES = [
  { value: 0, label: 'Ventana' },
  { value: 1, label: 'Puerta' },
  { value: 2, label: 'Mampara' },
  { value: 3, label: 'Batiente' },
  { value: 4, label: 'Tabaquera' },
  { value: 5, label: 'Proyectante' },
  { value: 6, label: 'Fijo' }
];

export const SERIES = [
  { value: 0, label: 'Serie 20' },
  { value: 1, label: 'Serie 30' },
  { value: 2, label: 'Serie 15' },
  { value: 3, label: 'Línea Probba' },
  { value: 4, label: 'Línea Summa' },
  { value: 5, label: 'Línea Gala' },
  { value: 6, label: 'Línea Gala CR' },
  { value: 7, label: 'Monoblock' },
  { value: 8, label: 'TUBO' },
  { value: 9, label: 'ÁNGULOS' },
  { value: 10, label: 'U' },
  { value: 11, label: 'Mampara' },
  { value: 12, label: 'Claraboya' },
  { value: 13, label: 'Serie 25' },
  { value: 14, label: 'Línea Probba DVH' }
];

export const GLASS_THICKNESS = [
  { value: 3, label: '3 mm' },
  { value: 4, label: '4 mm' },
  { value: 5, label: '5 mm' },
  { value: 6, label: '6 mm' },
  { value: 8, label: '8 mm' },
  { value: 10, label: '10 mm' },
  { value: 12, label: '12 mm' }
];

export const COLORS = [
  { value: 'natural', label: 'Natural anodizado' },
  { value: 'bronce', label: 'Bronce' },
  { value: 'negro', label: 'Negro' },
  { value: 'blanco', label: 'Blanco' },
  { value: 'gris', label: 'Gris plata' },
  { value: 'madera', label: 'Simil madera' }
];