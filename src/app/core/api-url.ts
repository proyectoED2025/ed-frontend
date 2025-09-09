import { environment } from '../../environments/environment';

export function buildApiUrl(path: string): string {
  const baseUrl = environment.apiBase.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${normalizedPath}`;
}

export function buildApiUrlWithParams(path: string, params: Record<string, string | number | boolean>): string {
  const baseUrl = buildApiUrl(path);
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.append(key, value.toString());
    }
  });
  
  const paramString = searchParams.toString();
  return paramString ? `${baseUrl}?${paramString}` : baseUrl;
}