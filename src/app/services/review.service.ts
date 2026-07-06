import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { BACKEND_API_URL } from '../shared/utils/api-url';

export interface ICreateReviewRequest {
  article_id: number;
  stars: number;
  comentario: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private httpClient = inject(HttpClient);
  private baseUrl = `${BACKEND_API_URL}/reviews`;

  createReview(payload: ICreateReviewRequest): Promise<void> {
    return lastValueFrom(this.httpClient.post<void>(this.baseUrl, payload));
  }
}