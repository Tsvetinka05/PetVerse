import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type AnimalType = 'dog' | 'cat' | 'other';

export interface AdoptionRequestDto {
  id: number;
  userId: string;
  message: string;
  status: 'new' | 'accepted' | 'rejected' | string;
}

export interface CreateShelterPostRequest {
  photo: File;
  title: string;
  body: string;
  type: AnimalType;
  shelterId: number;
}

export interface ShelterPostResponse {
  id: number;
  photo: string;
  title: string;
  body: string;
  type: AnimalType | string;
  shelterId: number;
  userId?: string;
  published: string;
  adoptedAt?: string | null;
  status: 'available' | 'adopted' | string;
  requests?: AdoptionRequestDto[];
}

export interface MarkShelterPostAsAdoptedRequest {
  postId: number;
  userId?: string;
}

@Injectable({ providedIn: 'root' })
export class ShelterPostsService {
  private readonly http = inject(HttpClient);

  private readonly CREATE_URL = '/api/posts/shelter/animal_adoption';
  private readonly GET_BY_SHELTER_URL = '/api/posts/shelter';
  private readonly GET_BY_ID_URL = '/api/posts/shelter/animal_adoption';
  private readonly MARK_ADOPTED_URL = '/api/posts/shelter/animal_adoption/adopt';

  createShelterPost(payload: CreateShelterPostRequest): Observable<ShelterPostResponse> {
    const params = new HttpParams()
      .set('ShelterId', String(payload.shelterId))
      .set('Type', payload.type)
      .set('Title', payload.title)
      .set('Body', payload.body);

    const form = new FormData();
    form.append('Photo', payload.photo);

    return this.http.post<ShelterPostResponse>(this.CREATE_URL, form, { params });
  }

  getPostsByShelterId(shelterId: number): Observable<ShelterPostResponse[]> {
    return this.http.get<ShelterPostResponse[]>(`${this.GET_BY_SHELTER_URL}/${shelterId}`);
  }

  getShelterPostById(id: number): Observable<ShelterPostResponse> {
    return this.http.get<ShelterPostResponse>(`${this.GET_BY_ID_URL}/${id}`);
  }

  markAsAdopted(payload: MarkShelterPostAsAdoptedRequest): Observable<ShelterPostResponse> {
    const body: { postId: number; userId?: string } = {
      postId: payload.postId,
    };

    if (payload.userId && payload.userId.trim().length > 0) {
      body.userId = payload.userId.trim();
    }

    return this.http.put<ShelterPostResponse>(this.MARK_ADOPTED_URL, body);
  }
}
