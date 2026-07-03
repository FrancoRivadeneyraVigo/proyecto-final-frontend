import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { IStyle } from "../shared/models/istyle.interface";
import { BACKEND_API_URL } from '../shared/utils/api-url';

type StylePayload = Omit<IStyle, 'id'>;

@Injectable({
  providedIn: 'root',
})
export class StyleService {

  private httpClient = inject(HttpClient);
  private apiUrl = BACKEND_API_URL;

  async getAll(): Promise<IStyle[]> {

    return await lastValueFrom(
      this.httpClient.get<IStyle[]>(
        `${this.apiUrl}/styles`
      )
    );

  }

  async create(style: StylePayload): Promise<IStyle> {

    return await lastValueFrom(
      this.httpClient.post<IStyle>(
        `${this.apiUrl}/styles`,
        style
      )
    );

  }

  async update(id: number, style: StylePayload): Promise<IStyle> {

    return await lastValueFrom(
      this.httpClient.put<IStyle>(
        `${this.apiUrl}/styles/${id}`,
        style
      )
    );

  }

  async delete(id: number): Promise<{ message: string }> {

    return await lastValueFrom(
      this.httpClient.delete<{ message: string }>(
        `${this.apiUrl}/styles/${id}`
      )
    );

  }

}
