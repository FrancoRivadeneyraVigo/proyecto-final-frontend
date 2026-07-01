import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ICreateReportRequest,
  IModerationMessageResponse,
  IRejectReportRequest,
  IReportDetail,
  IReportsPaginatedResponse,
  ReportStatusFilter,
} from '../shared/models/report.interface';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private httpClient = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/reports`;
  private moderationUrl = `${environment.apiUrl}/moderacion`;

  createReport(payload: ICreateReportRequest): Promise<void> {
    return lastValueFrom(this.httpClient.post<void>(this.baseUrl, payload));
  }

  getReports(
    status?: ReportStatusFilter,
    page = 1,
    limit = 10
  ): Promise<IReportsPaginatedResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status && status !== 'all') {
      params.set('status', status);
    }

    return lastValueFrom(
      this.httpClient.get<IReportsPaginatedResponse>(`${this.baseUrl}?${params.toString()}`)
    );
  }

  getReportDetail(id: number): Promise<IReportDetail> {
    return lastValueFrom(this.httpClient.get<IReportDetail>(`${this.baseUrl}/${id}`));
  }

  rejectReport(id: number, payload: IRejectReportRequest = {}): Promise<IModerationMessageResponse> {
    return lastValueFrom(
      this.httpClient.patch<IModerationMessageResponse>(
        `${this.moderationUrl}/reportes/${id}/rechazar`,
        payload
      )
    );
  }

  withdrawReportedArticle(articleId: number): Promise<IModerationMessageResponse> {
    return lastValueFrom(
      this.httpClient.patch<IModerationMessageResponse>(
        `${this.moderationUrl}/articulos/${articleId}/retirar`,
        {}
      )
    );
  }
}
