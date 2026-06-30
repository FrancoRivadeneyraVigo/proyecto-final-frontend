import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  IAdminReport,
  ICreateReportRequest,
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

  getReports(status?: ReportStatusFilter): Promise<IAdminReport[]> {
    const url =
      status && status !== 'all' ? `${this.baseUrl}?status=${status}` : this.baseUrl;
    return lastValueFrom(this.httpClient.get<IAdminReport[]>(url));
  }
}
