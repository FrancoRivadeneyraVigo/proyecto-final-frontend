import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { lastValueFrom } from "rxjs";
import { IModel } from "../shared/models/imodel.interface";
import { BACKEND_API_URL } from "../shared/utils/api-url";

@Injectable({
  providedIn: 'root',
})
export class ModelService {

  private httpClient = inject(HttpClient);
  private apiUrl = BACKEND_API_URL;

  async getByBrandId(
    brandId: number
  ): Promise<IModel[]> {

    return await lastValueFrom(
      this.httpClient.get<IModel[]>(
        `${this.apiUrl}/models/brand/${brandId}`
      )
    );

  }

}