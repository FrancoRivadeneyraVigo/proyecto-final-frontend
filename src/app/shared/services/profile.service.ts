import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IProfile } from '../models/profile.interface';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private httpClient = inject(HttpClient);
  private baseUrl: string = `${environment.apiUrl}/profiles`;

  async getById(userId: string): Promise<IProfile> {
    try {
      return await lastValueFrom(
        this.httpClient.get<IProfile>(`${this.baseUrl}/${userId}`)
      );
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      throw error;
    }
  }
}
