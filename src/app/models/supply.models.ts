export enum TypeSupply {
  Profile = 'Profile',
  Glass = 'Glass',
  Accessory = 'Accessory'
}

export const TypeSupplyNumeric: Record<TypeSupply, number> = {
  Profile: 0,
  Glass: 1,
  Accessory: 2
};

export type TypeSupplyValue = TypeSupply | number;

export interface SupplyBase {
  codeSupply: string;
  nameSupply: string;
  descriptionSupply: string;
  imageUrl?: string;
  nameSupplier: string;
  priceSupply: number;
}

export interface ProfileDto extends SupplyBase {
  profileWeigth: number;
  profileHeigth: number;
  weigthMetro: number;
  profileColor: string;
  Image?: File;
}

export interface GlassDto extends SupplyBase {
  glassThickness: number;
  glassLength: number;
  glassWidth: number;
  glassType: GlassType;
  Image?: File;
}

export interface AccessoryDto extends SupplyBase {
  descriptionAccessory: string;
  Image?: File;
}

export interface DeleteSupplyDto {
  codeSupply: string;
  type: TypeSupplyValue;
}

export interface EditSupplyDto {
  codeSupply: string;
  type: TypeSupplyValue;
  description: string;
}

export interface EditPriceSupplyDto {
  codeSupply: string;
  type: TypeSupplyValue;
  newPriceSupply: number;
}

export interface EditImageSupplyDto {
  codeSupply: string;
  type: TypeSupplyValue;
  Image: File;
}

export interface SupplyListResult {
  items: SupplyBase[];
  total?: number;
}

export enum GlassType {
  Float = 1,                    // Vidrio común
  Templado = 2,                // Vidrio templado  
  Laminado = 3,                // Vidrio laminado
  DobleAcristalamiento = 4,    // Vidrio doble (DVH o cámara)
  BajoEmisivo = 5,             // Vidrio con baja emisividad (Low-E)
  Reflectivo = 6,              // Vidrio con capa reflectiva
  Mateado = 7,                 // Vidrio esmerilado o ácido
  Decorativo = 8               // Vidrio con diseño, serigrafiado o impreso
}

export const GlassTypeLabels: Record<GlassType, string> = {
  [GlassType.Float]: 'Float',
  [GlassType.Templado]: 'Templado',
  [GlassType.Laminado]: 'Laminado',
  [GlassType.DobleAcristalamiento]: 'Doble Acristalamiento',
  [GlassType.BajoEmisivo]: 'Bajo Emisivo',
  [GlassType.Reflectivo]: 'Reflectivo',
  [GlassType.Mateado]: 'Mateado',
  [GlassType.Decorativo]: 'Decorativo'
};