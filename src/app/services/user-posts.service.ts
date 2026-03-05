import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type PetType = 'dog' | 'cat' | 'other';

export interface CreateLostAnimalPostRequest {
  photo: File;
  title: string;
  body: string;
  type: PetType;
}

export interface LostAnimalPostResponse {
  id: number;
  photoPath: string;
  title: string;
  type: PetType | string;
  body: string;
  userId: string;
  published: string;
  status: string;
  mediaPaths?: string[] | null;
}

@Injectable({ providedIn: 'root' })
export class UserPostsService {
  private readonly http = inject(HttpClient);
  private readonly API_BASE = '/api';

  private readonly CREATE_LOST_URL = `${this.API_BASE}/posts/user/lost_animal`;
  private readonly GET_POSTS_URL = `${this.API_BASE}/posts`;

  getPosts(pageNumber: number): Observable<LostAnimalPostResponse[]> {
    const params = new HttpParams().set('PageNumber', String(pageNumber));
    return this.http.get<LostAnimalPostResponse[]>(this.GET_POSTS_URL, { params });
  }

  createLostAnimalPost(payload: CreateLostAnimalPostRequest): Observable<LostAnimalPostResponse> {
    const params = new HttpParams()
      .set('Type', payload.type)
      .set('Title', payload.title)
      .set('Body', payload.body);

    const form = new FormData();
    form.append('Photo', payload.photo);

    return this.http.post<LostAnimalPostResponse>(this.CREATE_LOST_URL, form, { params });
  }
}
