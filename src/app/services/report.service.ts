import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { ICreateReportRequest } from '../shared/models/report.interface';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private httpClient = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/reports`;

  createReport(payload: ICreateReportRequest): Promise<void> {
    return lastValueFrom(this.httpClient.post<void>(this.baseUrl, payload));
  }
}
