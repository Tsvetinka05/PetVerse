import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FeedPostDto {
  id: number;
  title: string;
  body: string;
  published: string;

  photoPath?: string | null;
  mediaPaths?: string[] | null;

  photoUrl?: string | null;
  mediaUrl?: string | null;

  type?: string | null;
  status?: string | null;
  userId?: string | null;
}

@Injectable({ providedIn: 'root' })
export class FeedService {
  private readonly http = inject(HttpClient);

  getFeed(pageNumber: number): Observable<FeedPostDto[]> {
    const params = new HttpParams().set('PageNumber', String(pageNumber));
    return this.http.get<FeedPostDto[]>('/api/posts', { params });
  }
}
