import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

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
  private baseUrl = `${environment.apiUrl}/reviews`;

  createReview(payload: ICreateReviewRequest): Promise<void> {
    return lastValueFrom(this.httpClient.post<void>(this.baseUrl, payload));
  }
}