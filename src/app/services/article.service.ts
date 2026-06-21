import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IArticlesPaginatedResponse } from '../models/article.interface';

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  private httpClient = inject(HttpClient);
  private baseUrl: string = `${environment.apiUrl}/articles/user`;

  async getByUserId(
    userId: string,
    status?: string,
    page = 1,
    perPage = 10
  ): Promise<IArticlesPaginatedResponse> {
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    });

    if (status && status !== 'all') {
      params.set('status', status);
    }

    try {
      console.log(`${this.baseUrl}/${userId}?${params.toString()}`);
      return await lastValueFrom(
        this.httpClient.get<IArticlesPaginatedResponse>(
          `${this.baseUrl}/${userId}?${params.toString()}`
        )
      );
    } catch (error) {
      console.error('Error obteniendo artículos:', error);
      throw error;
    }
  }
}
