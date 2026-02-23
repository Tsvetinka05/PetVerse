import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BusinessDto {
  id: number | string;
  address: string;
  name: string;
  description: string;
  identificationNumber?: string;
}

@Injectable({ providedIn: 'root' })
export class BusinessService {
  private readonly http = inject(HttpClient);

  createBusiness(data: {
    address: string;
    name: string;
    description: string;
    identificationNumber?: string;
    logo: File;
  }): Observable<BusinessDto> {
    const formData = new FormData();
    formData.append('address', data.address);
    formData.append('name', data.name);
    formData.append('description', data.description);

    if (data.identificationNumber) {
      formData.append('identificationNumber', data.identificationNumber);
    }

    formData.append('logo', data.logo);

    return this.http.post<BusinessDto>('/api/business', formData);
  }

  getBusinessById(id: string | number): Observable<BusinessDto> {
    return this.http.get<BusinessDto>(`/api/business/${id}`);
  }
}
