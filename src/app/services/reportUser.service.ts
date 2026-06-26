import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { IReportProfileRequest } from '../shared/models/reportUser.interface';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private httpClient = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/users`;

  async reportProfile(userId: number | string, payload: IReportProfileRequest): Promise<void> {
    await lastValueFrom(
      this.httpClient.post<void>(`${this.baseUrl}/${userId}/reportes`, payload),
    );
  }
}
