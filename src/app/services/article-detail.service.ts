import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { IArticleDetail, IArticleSummary } from '../shared/models/article-detail.interface';

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  private httpClient = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/articles`;

  getArticleById(id: number | string): Promise<IArticleDetail> {
    return lastValueFrom(this.httpClient.get<IArticleDetail>(`${this.baseUrl}/${id}`));
  }

  async getSimilarArticles(id: number | string): Promise<IArticleSummary[]> {
    const articles = await lastValueFrom(
      this.httpClient.get<IArticleSummary[] | null>(`${this.baseUrl}/${id}/similares`),
    );

    return articles ?? [];
  }

  deleteArticle(id: number | string): Promise<void> {
    return lastValueFrom(this.httpClient.delete<void>(`${this.baseUrl}/${id}`));
  }

  async addFavorite(id: number | string): Promise<void> {
    await lastValueFrom(this.httpClient.post<void>(`${this.baseUrl}/${id}/favoritos`, {}));
  }

  async removeFavorite(id: number | string): Promise<void> {
    await lastValueFrom(this.httpClient.delete<void>(`${this.baseUrl}/${id}/favoritos`));
  }
}
