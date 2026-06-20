import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ILoginRequest, ILoginResponse, IMeResponse } from '../models/auth.interface';
import { IProfile } from '../models/profile.interface';

// Clave usada para guardar y recuperar el token en localStorage
const TOKEN_KEY = 'auth_token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private httpClient = inject(HttpClient);
  private baseUrl: string = `${environment.apiUrl}/auth`;

  // Estado reactivo: null = no hay sesión, IProfile = usuario logueado
  currentUser = signal<IProfile | null>(null);

  // Envía las credenciales al back, guarda el token recibido
  // y a continuación recupera el perfil completo del usuario
  async login(credentials: ILoginRequest): Promise<IProfile> {
    try {
      const loginRes = await lastValueFrom(
        this.httpClient.post<ILoginResponse>(`${this.baseUrl}/login`, credentials)
      );
      localStorage.setItem(TOKEN_KEY, loginRes.token);

      const profile = await this.fetchCurrentUser();
      if (!profile) {
        throw new Error('No se pudo obtener el perfil tras el login');
      }
      return profile;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  // Avisa al back de que se cierra sesión y, pase lo que pase,
  // limpia el token local y el estado del usuario actual
  async logout(): Promise<void> {
    try {
      await lastValueFrom(this.httpClient.post(`${this.baseUrl}/logout`, {}));
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      this.currentUser.set(null);
    }
  }

  // Si hay un token guardado, pregunta al back quién es el usuario actual
  // y guarda su perfil en el signal currentUser. Si no hay token, o la
  // petición falla, deja el estado como "no logueado"
  async fetchCurrentUser(): Promise<IProfile | null> {
    const token = this.getToken();
    if (!token) {
      this.currentUser.set(null);
      return null;
    }
    try {
      const raw = await lastValueFrom(
        this.httpClient.get<IMeResponse>(`${this.baseUrl}/me`)
      );
      this.currentUser.set(raw.profile);
      return raw.profile;
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      localStorage.removeItem(TOKEN_KEY);
      this.currentUser.set(null);
      return null;
    }
  }

  // Devuelve el token guardado en localStorage, o null si no existe
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // Atajo para saber rápidamente si hay una sesión activa
  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }
}