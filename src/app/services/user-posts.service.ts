import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type PetType = 'dog' | 'cat';

export interface CreateLostAnimalPostRequest {
  photo: File;
  title: string;
  body: string;
  type: PetType;
}

export interface LostAnimalPostResponse {
  id: number;
  photo: string;
  title: string;
  type: PetType;
  body: string;
  userId: number;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class UserPostsService {
  private readonly http = inject(HttpClient);

  private readonly CREATE_LOST_URL = '/api/posts/user/lost_animal';

  createLostAnimalPost(payload: CreateLostAnimalPostRequest): Observable<LostAnimalPostResponse> {
    const form = new FormData();
    form.append('photo', payload.photo);
    form.append('title', payload.title);
    form.append('body', payload.body);
    form.append('type', payload.type);

    return this.http.post<LostAnimalPostResponse>(this.CREATE_LOST_URL, form);
  }
}
