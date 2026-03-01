import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface CreateBusinessRequest {
  address: string;
  name: string;
  description: string;
  identificationNumber?: string;
  logo: File;
}

export interface CreateBusinessResponse {
  id: number | string;
}

export interface BusinessProfile {
  id: number | string;
  address: string;
  logoPath?: string;
  name: string;
  description: string;
  identificationNumber?: string;
  logoSrc?: string;
}

@Injectable({ providedIn: 'root' })
export class BusinessService {
  private readonly http = inject(HttpClient);

  private readonly CREATE_URL = '/api/profiles/business';
  private readonly GET_BY_ID_URL = '/api/profiles/business';

  private readonly ASSET_BASE = '';

  createBusiness(payload: CreateBusinessRequest): Observable<CreateBusinessResponse> {
    const form = new FormData();
    form.append('address', payload.address);
    form.append('name', payload.name);
    form.append('description', payload.description);
    if (payload.identificationNumber)
      form.append('identificationNumber', payload.identificationNumber);
    form.append('logo', payload.logo);
    return this.http.post<CreateBusinessResponse>(this.CREATE_URL, form);
  }

  getBusinessById(id: number | string): Observable<BusinessProfile> {
    return this.http.get<BusinessProfile>(`${this.GET_BY_ID_URL}/${id}`).pipe(
      map((p) => ({
        ...p,
        logoSrc: p.logoPath
          ? p.logoPath.startsWith('http')
            ? p.logoPath
            : `${this.ASSET_BASE}${p.logoPath}`
          : undefined,
      })),
    );
  }
}
