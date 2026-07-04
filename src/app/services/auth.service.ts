import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { ILoginRequest, ILoginResponse, IMeResponse, IRegisterRequest } from '../shared/models/auth.interface';
import { IProfile } from '../shared/models/profile.interface';
import { BACKEND_API_URL } from '../shared/utils/api-url';

// Clave usada para guardar y recuperar el token en localStorage
const TOKEN_KEY = 'auth_token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private httpClient = inject(HttpClient);
  private baseUrl: string = `${BACKEND_API_URL}/auth`;
  private usersUrl: string = `${BACKEND_API_URL}/users`;

  // Estado reactivo: null = no hay sesión, IProfile = usuario logueado
  currentUser = signal<IProfile | null>(null);

  // Indica si ya se ha completado la comprobación inicial de sesión
  authChecked = signal(false);

  // Envía las credenciales al back, guarda el token recibido
  // y actualiza el estado de sesión (currentUser) con los datos del usuario
  async login(credentials: ILoginRequest): Promise<void> {
    try {
      const loginRes = await lastValueFrom(
        this.httpClient.post<ILoginResponse>(`${this.baseUrl}/login`, credentials)
      );
      localStorage.setItem(TOKEN_KEY, loginRes.token);
      await this.fetchCurrentUser();
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  async register(credentials: IRegisterRequest): Promise<void> {
    try {
      const registerRes = await lastValueFrom(
        this.httpClient.post<ILoginResponse>(`${this.usersUrl}/register`, credentials)
      );
      localStorage.setItem(TOKEN_KEY, registerRes.token);
      await this.fetchCurrentUser();
    } catch (error) {
      console.error('Error en registro:', error);
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

  // Comprueba la sesión a partir del token guardado y actualiza
  // currentUser y authChecked en cualquier caso (con o sin sesión).
  async fetchCurrentUser(): Promise<IProfile | null> {
    const token = this.getToken();
    if (!token) {
      this.currentUser.set(null);
      this.authChecked.set(true);
      return null;
    }
    try {
      const raw = await lastValueFrom(
        this.httpClient.get<IMeResponse>(`${this.baseUrl}/me`)
      );
      const profile: IProfile = { ...raw.profile, rol: raw.rol };
      this.currentUser.set(profile);
      this.authChecked.set(true);
      return profile;
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      localStorage.removeItem(TOKEN_KEY);
      this.currentUser.set(null);
      this.authChecked.set(true);
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
