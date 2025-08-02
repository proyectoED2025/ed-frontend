export interface Sucursal {
  Id: number;
  Nombre: string;
}

export interface Tipo {
  Id: number;
  Nombre: string;
}

export interface Moneda {
  CurrencyCode: string;
  Nombre: string;
}

export interface Identificador {
  Value: string;
}

export interface Nombre {
  Value: string;
}

export interface Pais {
  ID: number;
  Nombre: string;
}

export interface Estado {
  ID: number;
  Nombre: string;
  Pais: Pais;
}

export interface Ciudad {
  ID: number;
  Nombre: string;
  Estado: Estado;
}

export interface TipoDireccion {
  Id: number;
  Nombre: string;
}

export interface Direccion {
  Tipo: TipoDireccion;
  Ciudad: Ciudad;
  Domicilio: string;
}

export interface Contacto {
  TipoEnte: number;
  Identificador1: Identificador;
  Nombre1: Nombre;
  Direcciones: Direccion[];
}

export interface ArticuloInfo {
  Codigo: string;
  Nombre: string;
}

export interface ArticuloFactura {
  Articulo: ArticuloInfo;
  Cantidad: number;
  PrecioUnitario: number;
}

export interface Financiacion {
  ProximoVencimiento: string;
}

export interface Factura {
  Fecha: string;
  Empresa: string;
  Sucursal: Sucursal;
  Tipo: Tipo;
  Moneda: Moneda;
  Contacto: Contacto;
  Vendedor: string;
  Articulos: ArticuloFactura[];
  ImporteTotal: number;
  TipoCambio: number;
  Comentario: string;
  PorcentajeDescuentoGlobal: number;
  Financiacion: Financiacion;
}

export interface Presupuesto {
  Id: number;
  Fecha: string;
  Cliente: string;
  Articulos: ArticuloFactura[];
  Total: number;
}