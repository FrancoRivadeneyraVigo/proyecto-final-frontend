import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ICreateReportRequest,
  IRejectReportRequest,
  IReportDetail,
  IReportFilters,
  IReportsPaginatedResponse,
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

  getReports(filters: IReportFilters = {}): Promise<IReportsPaginatedResponse> {
    const params = new URLSearchParams({
      page: (filters.page ?? 1).toString(),
      limit: (filters.limit ?? 10).toString(),
    });

    if (filters.status && filters.status !== 'all') {
      params.set('status', filters.status);
    }

    const search = filters.search?.trim();
    if (search) {
      params.set('search', search);
    }

    if (filters.reason) {
      params.set('reason', filters.reason);
    }

    if (filters.byreportype) {
      params.set('byreportype', filters.byreportype);
    }

    if (filters.created_from) {
      params.set('created_from', filters.created_from);
    }

    if (filters.created_to) {
      params.set('created_to', filters.created_to);
    }

    return lastValueFrom(
      this.httpClient.get<IReportsPaginatedResponse>(`${this.baseUrl}?${params.toString()}`)
    );
  }

  getReportDetail(id: number): Promise<IReportDetail> {
    return lastValueFrom(this.httpClient.get<IReportDetail>(`${this.baseUrl}/${id}`));
  }

  markReportUnderReview(id: number): Promise<void> {
    return lastValueFrom(
      this.httpClient.patch<void>(`${this.moderationUrl}/reportes/${id}/en_revision`, null)
    );
  }

  rejectReport(id: number, payload: IRejectReportRequest = {}): Promise<void> {
    return lastValueFrom(
      this.httpClient.patch<void>(`${this.moderationUrl}/reportes/${id}/rechazar`, payload)
    );
  }

  withdrawReportedArticle(articleId: number, reportId: number): Promise<void> {
    return lastValueFrom(
      this.httpClient.patch<void>(`${this.moderationUrl}/articulos/${articleId}/retirar`, { reportId })
    );
  }
}
