import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdoptionRequestCreate {
  adoptionPostId: number;
  message: string;
}

export interface AdoptionRequestResponse {
  id?: number;
  adoptionPostId?: number;
  message?: string;
  status?: 'new' | 'accepted' | 'rejected' | string;
}

@Injectable({ providedIn: 'root' })
export class AdoptionRequestsService {
  private readonly http = inject(HttpClient);
  private readonly URL = '/api/adoption_requests';

  createRequest(payload: AdoptionRequestCreate): Observable<AdoptionRequestResponse> {
    return this.http.post<AdoptionRequestResponse>(this.URL, {
      adoptionPostId: payload.adoptionPostId,
      message: payload.message,
    });
  }

  getRequestById(id: number): Observable<unknown> {
    return this.http.get(`${this.URL}/${id}`);
  }
  getRequestsForPost(postId: number): Observable<AdoptionRequestResponse[]> {
    return this.http.get<AdoptionRequestResponse[]>(`/api/adoption_requests/post/${postId}`);
  }
}
