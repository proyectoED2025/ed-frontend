export interface Product {
  id?: number;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  stock?: number;
  codeProduct: string;
  imageUrl?: string;
}

export enum ProductType {
  Ventana = 0,
  Puerta = 1,
  Mampara = 2,
  Batiente = 3,
  Tabaquera = 4,
  Proyectante = 5,
  Fijo = 6
}

export interface SupplyNecessaryDto {
  codeSupply: string;
  quantity: number;
}

export interface ProductDto {
  codeProduct: string;
  productName: string;
  productDescription: string;
  productCategory: ProductType;
  productPrice: number;
  Image?: File | null;
  imageUrl?: string | null;
  supplies: SupplyNecessaryDto[];
}

export interface UpdateDescriptionProductDto {
  codeProduct: string;
  description: string;
}

export interface UpdateImageProductDto {
  codeProduct: string;
  image: File;
}

export interface Supply {
  id?: number;
  name: string;
  quantity?: number;
  unit?: string;
  codeProduct?: string;
}

export interface ProductMovement {
  id?: number;
  productCode: string;
  productName?: string;
  movementType: string;
  quantity: number;
  date: string;
  description?: string;
}