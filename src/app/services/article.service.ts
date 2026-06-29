import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { IArticle } from '../shared/models/article.interface';
import { IArticlesPaginatedResponse } from '../shared/models/article.interface';
import { IArticleDetail, IArticleSeller, IArticleSummary } from '../shared/models/article-detail.interface';
import { ICreateArticle } from '../shared/models/icreate-article.component';

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  private httpClient = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  async getByUserId(
    userId: string,
    status?: string,
    page = 1,
    perPage = 10
  ): Promise<IArticlesPaginatedResponse> {

    const params = new URLSearchParams({
      page: page.toString(),
      limit: perPage.toString(),
    });

    if (status && status !== 'all') {
      params.set('status', status);
    }

    return await lastValueFrom(
      this.httpClient.get<IArticlesPaginatedResponse>(
        `${this.apiUrl}/articles/user/${userId}?${params.toString()}`
      )
    );
  }

  getArticleById(id: number): Promise<IArticleDetail> {
    return lastValueFrom(
      this.httpClient.get<IArticleDetail>(
        `${this.apiUrl}/articles/${id}`
      )
    );
  }

  async getSimilarArticles(id: number | string): Promise<IArticleSummary[]> {
    const articles = await lastValueFrom(
      this.httpClient.get<IArticleSummary[] | null>(`${this.apiUrl}/${id}/similares`),
    );

    return articles ?? [];
  }

  deleteArticle(id: number | string): Promise<void> {
    return lastValueFrom(this.httpClient.delete<void>(`${this.apiUrl}/${id}`));
  }

  async addFavorite(id: number | string): Promise<void> {
    await lastValueFrom(this.httpClient.post<void>(`${this.apiUrl}/${id}/favoritos`, {}));
  }

  async removeFavorite(id: number | string): Promise<void> {
    await lastValueFrom(this.httpClient.delete<void>(`${this.apiUrl}/${id}/favoritos`));
  }

  async createArticle(article: ICreateArticle): Promise<IArticle> {
    const response = await lastValueFrom(
      this.httpClient.post<{ article: IArticle }>(
        `${environment.apiUrl}/articles`,
        article
      )
    );

    return response.article;
  }

  async uploadImages(
    articleId: number,
    images: File[]
  ): Promise<void> {

    const formData = new FormData();

    images.forEach(image => {
      formData.append('images', image);
    });

    await lastValueFrom(
      this.httpClient.post(
        `${environment.apiUrl}/articles/${articleId}/images`,
        formData
      )
    );
  }

  async createArticleWithImages(
    article: ICreateArticle,
    images: File[]
  ): Promise<IArticle> {

    const createdArticle = await this.createArticle(article);

    if (images.length > 0) {
      await this.uploadImages(createdArticle.id, images);
    }

    return createdArticle;
  }

}