import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { IArticle, IArticlesPaginatedResponse } from '../shared/models/article.interface';
import { IArticleDetail, IArticleSummary } from '../shared/models/article-detail.interface';
import { ICreateArticle, IUpdateArticle } from '../shared/models/icreate-article.component';


@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  private httpClient = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private articlesUrl = `${environment.apiUrl}/articles`;

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
      this.httpClient.get<IArticleSummary[] | null>(`${this.articlesUrl}/${id}/similares`),
    );

    return articles ?? [];
  }

  deleteArticle(id: number | string): Promise<void> {
    return lastValueFrom(this.httpClient.delete<void>(`${this.articlesUrl}/${id}`));
  }

  async addFavorite(id: number | string): Promise<void> {
    await lastValueFrom(this.httpClient.post<void>(`${this.articlesUrl}/${id}/favoritos`, {}));
  }

  async removeFavorite(id: number | string): Promise<void> {
    await lastValueFrom(this.httpClient.delete<void>(`${this.articlesUrl}/${id}/favoritos`));
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

  async updateArticle(
    articleId: number,
    article: IUpdateArticle
  ): Promise<IArticle> {

    const response = await lastValueFrom(
      this.httpClient.put<{ article: IArticle }>(
        `${this.articlesUrl}/${articleId}`,
        article
      )
    );

    return response.article;
  }

  async deleteArticleImages(
    articleId: number,
    imageIds: number[]
  ): Promise<void> {

    await lastValueFrom(
      this.httpClient.delete(
        `${this.articlesUrl}/${articleId}/images`,
        { body: { image_ids: imageIds } }
      )
    );
  }

  // Agrupa, igual que al crear, la actualización de los datos del
  // artículo junto con la subida de imágenes nuevas y la eliminación
  // de las imágenes existentes que el usuario haya quitado
  async updateArticleWithImages(
    articleId: number,
    article: IUpdateArticle,
    newImages: File[],
    removedImageIds: number[]
  ): Promise<IArticle> {

    const updatedArticle = await this.updateArticle(articleId, article);

    if (removedImageIds.length > 0) {
      await this.deleteArticleImages(articleId, removedImageIds);
    }

    if (newImages.length > 0) {
      await this.uploadImages(articleId, newImages);
    }

    return updatedArticle;
  }

  // Saca un artículo del estado DRAFT y lo pasa a PUBLISHED
  async publishArticle(articleId: number): Promise<IArticle> {

    const response = await lastValueFrom(
      this.httpClient.patch<{ article: IArticle }>(
        `${this.articlesUrl}/${articleId}/publish`,
        {}
      )
    );

    return response.article;
  }

  async filterArticles(filters: any): Promise<IArticleSummary[]> {

  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {

    if (
      value !== null &&
      value !== undefined &&
      value !== ''
    ) {
      params.set(key, String(value));
    }

  });

  return await lastValueFrom(
    this.httpClient.get<IArticleSummary[]>(
      `${this.articlesUrl}/filter?${params.toString()}`
    )
  );

}

}