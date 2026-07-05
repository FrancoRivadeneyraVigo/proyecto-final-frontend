import { inject, Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { lastValueFrom } from 'rxjs';
import { BACKEND_API_URL } from '../shared/utils/api-url';

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  private httpClient = inject(HttpClient);
  private apiUrl = BACKEND_API_URL;

  async getPublishedArticles(): Promise<{ total: number }> {
    return lastValueFrom(
      this.httpClient.get<{ total: number }>(`${this.apiUrl}/stats/articulos-publicados`)
    );
  }

  async getSoldArticles(): Promise<{ total: number }> {
    return lastValueFrom(
      this.httpClient.get<{ total: number }>(`${this.apiUrl}/stats/articulos-vendidos`)
    );
  }

  async getActiveUsers(): Promise<{ total: number }> {
    return lastValueFrom(
      this.httpClient.get<{ total: number }>(`${this.apiUrl}/stats/usuarios-activos`)
    );
  }

  async getManagedReports(): Promise<{ total: number }> {
    return lastValueFrom(
      this.httpClient.get<{ total: number }>(`${this.apiUrl}/stats/reportes-gestionados`)
    );
  }

  async getReportsByStatus(periodo?: string): Promise<{ status: string, total: number }[]> {
    const url = periodo
      ? `${this.apiUrl}/stats/reportes-por-estado?periodo=${periodo}`
      : `${this.apiUrl}/stats/reportes-por-estado`;

    return lastValueFrom(
      this.httpClient.get<{ status: string, total: number }[]>(url)
    );
  }

  async getUsersByStatus(periodo?: string): Promise<{ status: string, total: number }[]> {
    const url = periodo
      ? `${this.apiUrl}/stats/usuarios-por-estado?periodo=${periodo}`
      : `${this.apiUrl}/stats/usuarios-por-estado`;

    return lastValueFrom(
      this.httpClient.get<{ status: string, total: number }[]>(url)
    )
  }

  async getArticlesByDate(periodo?: string): Promise<{ date: string, total: number }[]> {
    const url = periodo
      ? `${this.apiUrl}/stats/articulos-por-fecha?periodo=${periodo}`
      : `${this.apiUrl}/stats/articulos-por-fecha`;

    return lastValueFrom(
      this.httpClient.get<{ date: string, total: number }[]>(url)
    )
  }

  async getSessionByDate(periodo?: string): Promise<{ date: string, total: number }[]> {
    const url = periodo
      ? `${this.apiUrl}/stats/usuarios-por-fecha?periodo=${periodo}`
      : `${this.apiUrl}/stats/usuarios-por-fecha`;

    return lastValueFrom(
      this.httpClient.get<{ date: string, total: number }[]>(url)
    )
  }

}
