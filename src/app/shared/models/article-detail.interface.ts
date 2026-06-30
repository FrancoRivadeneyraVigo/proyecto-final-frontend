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

export interface IArticleImage {
  id: number;
  image_url: string;
  is_cover: boolean | number;
}

export interface IArticleBrand {
  id: number;
  name: string;
}

export interface IArticleModel {
  id: number;
  name: string;
  reference?: string | null;
  movement_type?: string | null;
  gender?: string | null;
}

export interface IArticleStyle {
  id: number;
  name: string;
}

export interface IArticleDetail {
  id: number;
  title: string;
  description?: string | null;
  price: number | string;
  city?: string | null;
  country?: string | null;
  year_of_manufacture?: number | null;
  condition?: string | null;
  case_material?: string | null;
  bracelet_material?: string | null;
  original_box?: boolean | number;
  original_papers?: boolean | number;
  shipping_available?: boolean | number;
  style_name?: string | null;
  movement_type?: string | null;
  reference?: string | null;
  status?: string | null;
  images: IArticleImage[];
  is_favorite?: boolean;
  fk_usuarios_id: number;
  seller?: IArticleSeller | null;
  brand?: IArticleBrand | null;
  model?: IArticleModel | null;
  style?: IArticleStyle | null;
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
