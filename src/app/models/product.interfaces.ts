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

export interface ProductDto {
  name: string;
  description: string;
  price: number;
  category: string;
  codeProduct: string;
  image?: File;
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