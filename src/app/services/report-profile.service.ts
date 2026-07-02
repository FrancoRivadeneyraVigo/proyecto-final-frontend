import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { ICreateProfileReportRequest } from '../shared/models/report.interface';

@Injectable({
  providedIn: 'root',
})
export class ReportProfileService {
  private httpClient = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/profile`;

  reportProfile(userId: number, payload: ICreateProfileReportRequest): Promise<{ message: string }> {
    return lastValueFrom(
      this.httpClient.post<{ message: string }>(`${this.baseUrl}/${userId}/reportes`, payload),
    );
  }
}
