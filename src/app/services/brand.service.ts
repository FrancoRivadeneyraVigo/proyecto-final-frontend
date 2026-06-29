import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { IBrandResponse } from '../shared/models/brand.interface';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  private httpClient = inject(HttpClient);
  private baseUrl: string = `${environment.apiUrl}/brands`;

  async getAll(page: number = 1, limit: number = 6): Promise<IBrandResponse>{
    try {
      return await lastValueFrom (
        this.httpClient.get<IBrandResponse>(`${this.baseUrl}?page=${page}&limit=${limit}`)
      )
    }catch(error){
      console.error('Error obteniendo marcas:', error)
      throw error;
    }
  }

}
