import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { lastValueFrom } from "rxjs";
import { IBrand, IBrandsResponse } from "../shared/models/ibrand.interface";
import { BACKEND_API_URL } from "../shared/utils/api-url";

@Injectable({
  providedIn: 'root',
})
export class BrandService {

  private httpClient = inject(HttpClient);
  private apiUrl = BACKEND_API_URL;

  async getAll(
    page = 1,
    limit = 100
  ): Promise<IBrandsResponse> {

    return await lastValueFrom(
      this.httpClient.get<IBrandsResponse>(
        `${this.apiUrl}/brands?page=${page}&limit=${limit}`
      )
    );

  }

  async search(term: string): Promise<IBrand[]> {

    return await lastValueFrom(
      this.httpClient.get<IBrand[]>(
        `${this.apiUrl}/brands/search/${term}`
      )
    );

  }

}