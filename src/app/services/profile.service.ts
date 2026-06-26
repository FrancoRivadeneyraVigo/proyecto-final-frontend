import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  IProfile,
  IUpdateProfileRequest,
  IUploadPhotoResponse,
} from '../shared/models/profile.interface';

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

  async updateById(userId: string | undefined, payload: IUpdateProfileRequest): Promise<IProfile> {
    const url = userId ? `${this.baseUrl}/${userId}` : this.baseUrl;
    try {
      return await lastValueFrom(
        this.httpClient.put<IProfile>(url, payload)
      );
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      throw error;
    }
  }

  async uploadPhoto(file: File): Promise<IUploadPhotoResponse> {
    const formData = new FormData();
    formData.append('photo', file);

    try {
      return await lastValueFrom(
        this.httpClient.post<IUploadPhotoResponse>(`${this.baseUrl}/photo`, formData)
      );
    } catch (error) {
      console.error('Error subiendo foto de perfil:', error);
      throw error;
    }
  }

  async deletePhoto(): Promise<void> {
    try {
      await lastValueFrom(this.httpClient.delete(`${this.baseUrl}/photo`));
    } catch (error) {
      console.error('Error eliminando foto de perfil:', error);
      throw error;
    }
  }
}
