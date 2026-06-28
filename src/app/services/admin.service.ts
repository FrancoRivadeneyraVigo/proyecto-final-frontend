import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { IAdminProfile, IProfileDetailUser } from '../shared/models/profile.interface';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private httpClient = inject(HttpClient);
  private baseUrl: string = `${environment.apiUrl}/profiles`;

  // Trae todos los perfiles combinando los 3 roles, agrupando duplicados
  // (un mismo usuario puede tener varios roles) y concatenando sus roles con coma
  async getAllProfilesWithRole(): Promise<IAdminProfile[]> {
    const [users, moderators, admins] = await Promise.all([
      this.getProfilesByRole('user'),
      this.getProfilesByRole('moderator'),
      this.getProfilesByRole('admin'),
    ]);

    const combined = [...users, ...moderators, ...admins];
    const grouped = new Map<number, IAdminProfile>();

    for (const profile of combined) {
      const existing = grouped.get(profile.id);
      if (existing) {
        existing.rol = `${existing.rol}, ${profile.rol}`;
      } else {
        grouped.set(profile.id, { ...profile });
      }
    }

    return Array.from(grouped.values());
  }

  // Trae los perfiles de un rol concreto (sí incluye "rol" en la respuesta)
  async getProfilesByRole(rol: string): Promise<IAdminProfile[]> {
    return lastValueFrom(
      this.httpClient.get<IAdminProfile[]>(`${this.baseUrl}?rol=${rol}`)
    );
  }

  // Trae el detalle completo de un usuario (vista admin). Por ahora solo
  // se usa la parte "user" de la respuesta; el resto (compras, reportes...)
  // queda pendiente de añadir cuando se necesite.
  async getProfileDetail(userId: number): Promise<IProfileDetailUser> {
    const response = await lastValueFrom(
      this.httpClient.get<{ user: IProfileDetailUser }>(`${this.baseUrl}/${userId}/detail`)
    );
    return response.user;
  }
}