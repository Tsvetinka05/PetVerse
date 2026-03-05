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

export interface CreateShelterPostResponse {
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

  createShelterPost(payload: CreateShelterPostRequest): Observable<CreateShelterPostResponse> {
    const form = new FormData();
    form.append('Photo', payload.photo);
    form.append('Title', payload.title);
    form.append('Body', payload.body);
    form.append('Type', payload.type);
    form.append('ShelterId', String(payload.shelterId));

    return this.http.post<CreateShelterPostResponse>(this.CREATE_URL, form);
  }
}
