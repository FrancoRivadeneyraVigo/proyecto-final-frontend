import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { ICreateProfileReportRequest } from '../shared/models/report.interface';
import { BACKEND_API_URL } from '../shared/utils/api-url';

@Injectable({
  providedIn: 'root',
})
export class ReportProfileService {
  private httpClient = inject(HttpClient);
  private baseUrl = `${BACKEND_API_URL}/profile`;

  reportProfile(userId: number, payload: ICreateProfileReportRequest): Promise<{ message: string }> {
    return lastValueFrom(
      this.httpClient.post<{ message: string }>(`${this.baseUrl}/${userId}/reportes`, payload),
    );
  }
}
