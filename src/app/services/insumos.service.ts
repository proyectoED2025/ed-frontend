import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { buildApiUrl, buildApiUrlWithParams } from '../core/api-url';
import { API_ROUTES } from '../core/api-routes';
import {
  ProfileDto,
  GlassDto,
  AccessoryDto,
  DeleteSupplyDto,
  EditSupplyDto,
  EditPriceSupplyDto,
  EditImageSupplyDto,
  SupplyBase,
  SupplyListResult,
  TypeSupply,
  TypeSupplyValue
} from '../models/supply.models';

@Injectable({
  providedIn: 'root'
})
export class InsumosService {
  private readonly baseUrl = '';

  private profileCache = new BehaviorSubject<SupplyBase[]>([]);
  private glassCache = new BehaviorSubject<SupplyBase[]>([]);
  private accessoryCache = new BehaviorSubject<SupplyBase[]>([]);

  public profiles$ = this.profileCache.asObservable();
  public glasses$ = this.glassCache.asObservable();
  public accessories$ = this.accessoryCache.asObservable();

  constructor(private http: HttpClient) {}

  addProfile(fd: FormData): Observable<any> {
    return this.http.post(buildApiUrl(API_ROUTES.ALTA_PERFIL), fd).pipe(
      tap(() => this.refreshProfiles()),
      catchError(error => {
        console.error('Error adding profile:', error);
        throw error;
      })
    );
  }

  addGlass(fd: FormData): Observable<any> {
    return this.http.post(buildApiUrl(API_ROUTES.ALTA_VIDRIO), fd).pipe(
      tap(() => this.refreshGlasses()),
      catchError(error => {
        console.error('Error adding glass:', error);
        throw error;
      })
    );
  }

  addAccessory(fd: FormData): Observable<any> {
    return this.http.post(buildApiUrl(API_ROUTES.ALTA_ACCESORIO), fd).pipe(
      tap(() => this.refreshAccessories()),
      catchError(error => {
        console.error('Error adding accessory:', error);
        throw error;
      })
    );
  }

  deleteSupply(payload: DeleteSupplyDto): Observable<any> {
    return this.http.delete(buildApiUrl(API_ROUTES.BAJA_INSUMO), { body: payload }).pipe(
      tap(() => this.refreshCacheByType(payload.type)),
      catchError(error => {
        console.error('Error deleting supply:', error);
        throw error;
      })
    );
  }

  updateDescription(payload: EditSupplyDto): Observable<any> {
    return this.http.put(buildApiUrl(API_ROUTES.EDITAR_DESCRIPCION_INSUMO), payload).pipe(
      tap(() => this.refreshCacheByType(payload.type)),
      catchError(error => {
        console.error('Error updating description:', error);
        throw error;
      })
    );
  }

  updatePrice(payload: EditPriceSupplyDto): Observable<any> {
    return this.http.put(buildApiUrl(API_ROUTES.EDITAR_PRECIO_INSUMO), payload).pipe(
      tap(() => this.refreshCacheByType(payload.type)),
      catchError(error => {
        console.error('Error updating price:', error);
        throw error;
      })
    );
  }

  updateImage(fd: FormData): Observable<any> {
    return this.http.put(buildApiUrl(API_ROUTES.EDITAR_IMAGEN_INSUMO), fd).pipe(
      tap(() => {
        const type = fd.get('type');
        if (type) {
          this.refreshCacheByType(type as TypeSupplyValue);
        }
      }),
      catchError(error => {
        console.error('Error updating image:', error);
        throw error;
      })
    );
  }

  getAllSupplies(): Observable<SupplyBase[]> {
    return this.http.get<SupplyBase[]>(buildApiUrl(API_ROUTES.INSUMOS)).pipe(
      tap((supplies) => {
        // Distribute supplies by type into caches
        const profiles: SupplyBase[] = [];
        const glasses: SupplyBase[] = [];
        const accessories: SupplyBase[] = [];

        supplies.forEach(supply => {
          const supplyWithType = supply as any;
          switch (supplyWithType.type) {
            case 'Profile':
              profiles.push(supply);
              break;
            case 'Glass':
              glasses.push(supply);
              break;
            case 'Accessory':
              accessories.push(supply);
              break;
          }
        });

        this.profileCache.next(profiles);
        this.glassCache.next(glasses);
        this.accessoryCache.next(accessories);
      }),
      catchError(error => {
        console.error('Error fetching all supplies:', error);
        throw error;
      })
    );
  }

  getByType(type: TypeSupplyValue): Observable<SupplyBase[]> {
    return this.http.get<SupplyBase[]>(buildApiUrlWithParams(API_ROUTES.INSUMOS, { type })).pipe(
      tap((supplies) => {
        // Update only the specific type cache
        switch (this.getTypeAsEnum(type)) {
          case TypeSupply.Profile:
            this.profileCache.next(supplies);
            break;
          case TypeSupply.Glass:
            this.glassCache.next(supplies);
            break;
          case TypeSupply.Accessory:
            this.accessoryCache.next(supplies);
            break;
        }
      }),
      catchError(error => {
        console.error(`Error fetching ${type} supplies:`, error);
        throw error;
      })
    );
  }

  listByType(type: TypeSupplyValue, q?: string, page?: number, pageSize?: number): Observable<SupplyListResult> {

    let cache: SupplyBase[] = [];

    switch (this.getTypeAsEnum(type)) {
      case TypeSupply.Profile:
        cache = this.profileCache.value;
        break;
      case TypeSupply.Glass:
        cache = this.glassCache.value;
        break;
      case TypeSupply.Accessory:
        cache = this.accessoryCache.value;
        break;
    }

    let filtered = cache;

    if (q) {
      const query = q.toLowerCase();
      filtered = cache.filter(item =>
        item.codeSupply.toLowerCase().includes(query) ||
        item.nameSupply.toLowerCase().includes(query)
      );
    }

    if (page && pageSize) {
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      filtered = filtered.slice(start, end);
    }

    return of({
      items: filtered,
      total: cache.length
    });
  }

  toFormData<T extends Record<string, any>>(dto: T): FormData {
    const formData = new FormData();

    Object.keys(dto).forEach(key => {
      const value = dto[key];
      if (value !== null && value !== undefined) {
        if (value instanceof File) {
          formData.append('Image', value);
        } else if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
          // Include all primitive values, including 0, empty strings, false
          formData.append(key, value.toString());
        } else if (value !== '' || key === 'type') {
          // Include non-empty values and always include 'type' field
          formData.append(key, value.toString());
        }
      }
    });

    return formData;
  }

  private refreshProfiles(): void {
    this.getByType(this.getTypeAsBackend(TypeSupply.Profile)).subscribe({
      next: () => {
        // Cache is automatically updated by getByType method
      },
      error: (error) => {
        console.error('Error refreshing profiles:', error);
      }
    });
  }

  private refreshGlasses(): void {
    this.getByType(this.getTypeAsBackend(TypeSupply.Glass)).subscribe({
      next: () => {
        // Cache is automatically updated by getByType method
      },
      error: (error) => {
        console.error('Error refreshing glasses:', error);
      }
    });
  }

  private refreshAccessories(): void {
    this.getByType(this.getTypeAsBackend(TypeSupply.Accessory)).subscribe({
      next: () => {
        // Cache is automatically updated by getByType method
      },
      error: (error) => {
        console.error('Error refreshing accessories:', error);
      }
    });
  }

  private refreshCacheByType(type: TypeSupplyValue): void {
    switch (this.getTypeAsEnum(type)) {
      case TypeSupply.Profile:
        this.refreshProfiles();
        break;
      case TypeSupply.Glass:
        this.refreshGlasses();
        break;
      case TypeSupply.Accessory:
        this.refreshAccessories();
        break;
    }
  }

  private getTypeAsEnum(type: TypeSupplyValue): TypeSupply {
    if (typeof type === 'string') {
      return type as TypeSupply;
    }

    // Convert numeric to enum
    switch (type) {
      case 0: return TypeSupply.Profile;
      case 1: return TypeSupply.Glass;
      case 2: return TypeSupply.Accessory;
      default: throw new Error(`Invalid type: ${type}`);
    }
  }

  getTypeAsBackend(type: TypeSupply): TypeSupplyValue {
    // TODO: Adjust this based on backend configuration
    // If backend uses JsonStringEnumConverter, return string
    // If backend uses numeric enums, return number
    return type; // Return as string by default
    // Alternative: return TypeSupplyNumeric[type]; // Return as number
  }

  // Helper methods for optimistic UI updates
  addSupplyToCache(supply: SupplyBase, type: TypeSupply): void {
    switch (type) {
      case TypeSupply.Profile:
        const currentProfiles = this.profileCache.value;
        this.profileCache.next([...currentProfiles, supply]);
        break;
      case TypeSupply.Glass:
        const currentGlasses = this.glassCache.value;
        this.glassCache.next([...currentGlasses, supply]);
        break;
      case TypeSupply.Accessory:
        const currentAccessories = this.accessoryCache.value;
        this.accessoryCache.next([...currentAccessories, supply]);
        break;
    }
  }

  updateSupplyInCache(updatedSupply: SupplyBase, type: TypeSupply): void {
    const updateCache = (cache: BehaviorSubject<SupplyBase[]>) => {
      const currentItems = cache.value;
      const updatedItems = currentItems.map(item => 
        item.codeSupply === updatedSupply.codeSupply ? updatedSupply : item
      );
      cache.next(updatedItems);
    };

    switch (type) {
      case TypeSupply.Profile:
        updateCache(this.profileCache);
        break;
      case TypeSupply.Glass:
        updateCache(this.glassCache);
        break;
      case TypeSupply.Accessory:
        updateCache(this.accessoryCache);
        break;
    }
  }

  removeSupplyFromCache(codeSupply: string, type: TypeSupply): void {
    const removeFromCache = (cache: BehaviorSubject<SupplyBase[]>) => {
      const currentItems = cache.value;
      const filteredItems = currentItems.filter(item => item.codeSupply !== codeSupply);
      cache.next(filteredItems);
    };

    switch (type) {
      case TypeSupply.Profile:
        removeFromCache(this.profileCache);
        break;
      case TypeSupply.Glass:
        removeFromCache(this.glassCache);
        break;
      case TypeSupply.Accessory:
        removeFromCache(this.accessoryCache);
        break;
    }
  }
}
