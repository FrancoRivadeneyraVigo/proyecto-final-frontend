import { inject, Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  private httpClient = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  async publishedArticles(): Promise<{ total: number }> {
    return await lastValueFrom(
      this.httpClient.get<{ total: number }>(`${this.apiUrl}/stats/articulos-publicados`)
    );
  }

  async soldArticles(): Promise<{ total: number }> {
    return await lastValueFrom(
      this.httpClient.get<{ total: number }>(`${this.apiUrl}/stats/articulos-vendidos`)
    );
  }

  async activeUsers(): Promise<{ total: number }> {
    return await lastValueFrom(
      this.httpClient.get<{ total: number }>(`${this.apiUrl}/stats/usuarios-activos`)
    );
  }

  async managedReports(): Promise<{ total: number }> {
    return await lastValueFrom(
      this.httpClient.get<{ total: number }>(`${this.apiUrl}/stats/reportes-gestionados`)
    );
  }

}
