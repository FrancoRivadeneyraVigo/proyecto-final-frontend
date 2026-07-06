import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { IReportProfileRequest } from '../shared/models/reportUser.interface';
import { BACKEND_API_URL } from '../shared/utils/api-url';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private httpClient = inject(HttpClient);
  private baseUrl = `${BACKEND_API_URL}/profile`;

  async reportProfile(userId: number | string, payload: IReportProfileRequest): Promise<void> {
    await lastValueFrom(
      this.httpClient.post<void>(`${this.baseUrl}/${userId}/reportes`, payload),
    );
  }
}
