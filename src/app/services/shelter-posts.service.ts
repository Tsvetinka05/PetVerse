import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type AnimalType = 'dog' | 'cat';

export interface CreateShelterPostRequest {
  photo: File;
  title: string;
  body: string;
  type: AnimalType;
  shelterId: number;
}

export interface ShelterPostResponse {
  photo: string;
  title: string;
  body: string;
  type: AnimalType;
  shelterId: number;
  userId?: number;
  published: string;
  adoptedAt?: string | null;
  status: 'available' | 'adopted';
}

@Injectable({ providedIn: 'root' })
export class ShelterPostsService {
  private readonly http = inject(HttpClient);

  private readonly CREATE_URL = '/api/posts/shelter/animal_adoption';
  private readonly GET_BY_SHELTER_URL = '/api/posts/shelter';

  createShelterPost(payload: CreateShelterPostRequest): Observable<ShelterPostResponse> {
    const form = new FormData();

    form.append('Photo', payload.photo);
    form.append('Title', payload.title);
    form.append('Body', payload.body);
    form.append('Type', payload.type);
    form.append('ShelterId', String(payload.shelterId));

    return this.http.post<ShelterPostResponse>(this.CREATE_URL, form);
  }

  getPostsByShelterId(shelterId: number): Observable<ShelterPostResponse[]> {
    return this.http.get<ShelterPostResponse[]>(`${this.GET_BY_SHELTER_URL}/${shelterId}`);
  }
}
