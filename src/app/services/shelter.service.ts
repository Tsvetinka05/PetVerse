import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface CreateShelterRequest {
  address: string;
  name: string;
  iban: string;
  logo: File;
}

export interface CreateShelterResponse {
  id: number | string;
}

export interface ShelterProfile {
  id: number | string;
  address: string;
  logoPath?: string;
  name: string;
  iban: string;
  logoSrc?: string;
}

@Injectable({ providedIn: 'root' })
export class ShelterService {
  private readonly http = inject(HttpClient);

  private readonly CREATE_URL = '/api/profiles/shelter';
  private readonly GET_BY_ID_URL = '/api/profiles/shelter';

  private readonly ASSET_BASE = '';

  createShelter(payload: CreateShelterRequest): Observable<CreateShelterResponse> {
    const form = new FormData();
    form.append('address', payload.address);
    form.append('name', payload.name);
    form.append('iban', payload.iban);
    form.append('logo', payload.logo);
    return this.http.post<CreateShelterResponse>(this.CREATE_URL, form);
  }

  getShelterById(id: number | string): Observable<ShelterProfile> {
    return this.http.get<ShelterProfile>(`${this.GET_BY_ID_URL}/${id}`).pipe(
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
