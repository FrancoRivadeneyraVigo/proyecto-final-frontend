import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { lastValueFrom } from "rxjs";
import { environment } from "../../environments/environment";
import { IModel } from "../shared/models/imodel.interface";

@Injectable({
  providedIn: 'root',
})
export class ModelService {

  private httpClient = inject(HttpClient);
  private apiUrl = environment.apiUrl;

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