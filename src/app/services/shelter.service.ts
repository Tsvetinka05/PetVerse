import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ShelterDto {
  id: number | string;
  address: string;
  name: string;
  iban: string;
}

@Injectable({ providedIn: 'root' })
export class ShelterService {
  private readonly http = inject(HttpClient);

  createShelter(data: {
    address: string;
    name: string;
    iban: string;
    logo: File;
  }): Observable<ShelterDto> {
    const formData = new FormData();
    formData.append('address', data.address);
    formData.append('name', data.name);
    formData.append('iban', data.iban);
    formData.append('logo', data.logo);

    return this.http.post<ShelterDto>('/api/shelter', formData);
  }

  getShelterById(id: string | number): Observable<ShelterDto> {
    return this.http.get<ShelterDto>(`/api/shelter/${id}`);
  }
}
