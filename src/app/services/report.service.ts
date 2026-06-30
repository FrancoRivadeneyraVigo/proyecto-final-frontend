import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ICreateReportRequest,
  IReportsPaginatedResponse,
  ReportStatusFilter,
} from '../shared/models/report.interface';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private httpClient = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/reports`;

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
}
