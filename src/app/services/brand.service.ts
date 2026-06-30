import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { lastValueFrom } from "rxjs";
import { environment } from "../../environments/environment";
import { IBrand, IBrandsResponse } from "../shared/models/ibrand.interface";

@Injectable({
  providedIn: 'root',
})
export class BrandService {

  private httpClient = inject(HttpClient);
  private apiUrl = environment.apiUrl;

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