import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type CommentType = 'lost' | 'adoption' | 'event' | 'service';

export interface CommentDto {
  commentId: number;
  postId: number;
  comment: string;
  time: string;
  userId: string;
  type: string;
}

export interface CreateCommentRequest {
  postId: number;
  comment: string;
  type: CommentType;
}

@Injectable({ providedIn: 'root' })
export class CommentsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/comments';

  getComments(postId: number, type: CommentType): Observable<CommentDto[]> {
    const params = new HttpParams().set('PostId', String(postId)).set('Type', type);

    return this.http.get<CommentDto[]>(this.baseUrl, { params });
  }

  createComment(payload: CreateCommentRequest): Observable<string> {
    return this.http.post(
      this.baseUrl,
      {
        postId: payload.postId,
        comment: payload.comment,
        type: payload.type,
      },
      { responseType: 'text' },
    );
  }

  getCommentById(id: number): Observable<CommentDto> {
    return this.http.get<CommentDto>(`${this.baseUrl}/${id}`);
  }
}
