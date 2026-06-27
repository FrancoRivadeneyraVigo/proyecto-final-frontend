import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { IAdminProfile } from '../shared/models/profile.interface';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private httpClient = inject(HttpClient);
  private baseUrl: string = `${environment.apiUrl}/profiles`;

  // Trae todos los perfiles combinando los 3 roles, ya que el endpoint
  // sin filtro no incluye el campo "rol" en la respuesta
  async getAllProfilesWithRole(): Promise<IAdminProfile[]> {
    const [users, moderators, admins] = await Promise.all([
      this.getProfilesByRole('user'),
      this.getProfilesByRole('moderator'),
      this.getProfilesByRole('admin'),
    ]);
    return [...users, ...moderators, ...admins];
  }

  // Trae los perfiles de un rol concreto (sí incluye "rol" en la respuesta)
  async getProfilesByRole(rol: string): Promise<IAdminProfile[]> {
    return lastValueFrom(
      this.httpClient.get<IAdminProfile[]>(`${this.baseUrl}?rol=${rol}`)
    );
  }
}
