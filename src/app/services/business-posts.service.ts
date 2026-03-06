import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateBusinessPostRequest {
  businessId: number;
  title: string;
  body: string;
  media: File[];
}

export interface BusinessPostResponse {
  mediaPaths: string[];
  title: string;
  body: string;
  businessId: number;
  userId: number;
  published: string;
}

@Injectable({ providedIn: 'root' })
export class BusinessPostsService {
  private readonly http = inject(HttpClient);

  private readonly CREATE_URL = '/api/posts/business/business_post';
  private readonly GET_BY_BUSINESS_URL = '/api/posts/business';

  createBusinessPost(payload: CreateBusinessPostRequest): Observable<BusinessPostResponse> {
    const params = new HttpParams()
      .set('BusinessId', payload.businessId)
      .set('Title', payload.title)
      .set('Body', payload.body);

    const form = new FormData();

    for (const f of payload.media) {
      form.append('Media', f);
    }

    return this.http.post<BusinessPostResponse>(this.CREATE_URL, form, { params });
  }

  getPostsByBusinessId(businessId: number): Observable<BusinessPostResponse[]> {
    return this.http.get<BusinessPostResponse[]>(`${this.GET_BY_BUSINESS_URL}/${businessId}`);
  }
}
