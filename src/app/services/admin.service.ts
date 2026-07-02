import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { IAdminProfile } from '../shared/models/profile.interface';
import { IAdminProfileDetail } from '../shared/models/profile-activity.interface';

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

  // Trae el detalle completo de un usuario (vista admin): datos del perfil,
  // compras, ventas, valoraciones, favoritos y reportes.
  async getProfileDetail(userId: number): Promise<IAdminProfileDetail> {
    return lastValueFrom(
      this.httpClient.get<IAdminProfileDetail>(`${this.baseUrl}/${userId}/detail`)
    );
}

// Bloquear usuario
async blockProfile(userId: number): Promise<{ message: string }> {
  return lastValueFrom(
    this.httpClient.patch<{ message: string }>(`${this.baseUrl}/${userId}/block`, {})
  );
}
// Desbloquear usuario
async unblockProfile(userId: number): Promise<{ message: string }> {
  return lastValueFrom(
    this.httpClient.patch<{ message: string }>(`${this.baseUrl}/${userId}/unblock`, {})
  );
}
// Dar de baja
async deleteProfile(userId: number): Promise<{ message: string }> {
  return lastValueFrom(
    this.httpClient.delete<{ message: string }>(`${this.baseUrl}/${userId}`)
  );
}

}