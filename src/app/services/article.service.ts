import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { IArticle, IArticlesPaginatedResponse } from '../shared/models/article.interface';


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
  
  async getAll(limit?: number): Promise<IArticlesPaginatedResponse> {
    return await lastValueFrom(
      this.httpClient.get<IArticlesPaginatedResponse>(`${environment.apiUrl}/articles?limit=${limit}`)
    );

  }

  async searchArticles (term:string): Promise<IArticle[]> {
    return await lastValueFrom(
      this.httpClient.get<IArticle[]>(`${environment.apiUrl}/articles/search/${term}`)
    );
  }



}


