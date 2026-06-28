import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { IStyle } from "../shared/models/istyle.interface";

@Injectable({
  providedIn: 'root',
})
export class StyleService {

  private httpClient = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  async getAll(): Promise<IStyle[]> {

    return await lastValueFrom(
      this.httpClient.get<IStyle[]>(
        `${this.apiUrl}/styles`
      )
    );

  }

}