export interface IArticleSeller {
  id: number;
  username: string;
  name: string;
  surname: string;
  photo_url: string | null;
  rating: string | number;
  rating_count: number;
  sales_count: number;
  purchases_count: number;
  member_since: string | number;
}

export interface IArticleDetail {
  id: number;
  title: string;
  brand?: string | null;
  description?: string | null;
  price: number | string;
  city?: string | null;
  country?: string | null;
  year_of_manufacture?: number | null;
  condition?: string | null;
  style_name?: string | null;
  movement_type?: string | null;
  reference?: string | null;
  status?: string | null;
  images: string[];
  is_favorite?: boolean;
  fk_users_id: number;
  seller?: IArticleSeller | null;
}

export interface IArticleSummary {
  id: number;
  title: string;
  description?: string | null;
  price: number | string;
  city?: string | null;
  country?: string | null;
  year_of_manufacture?: number | null;
  condition?: string | null;
  diameter_mm?: number | null;
  cover?: string | null;
  is_favorite?: boolean;
}

export interface IArticlesPaginatedResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: IArticleSummary[];
}
