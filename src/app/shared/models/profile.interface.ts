import { IArticle } from './article.interface';

export interface IProfileStats {
  sales_count: number;
  purchases_count: number;
  reviews_count: number;
  member_since: number | null;
}

export interface IProfile {
  id: number;
  username: string;
  rating: string;
  photo_url: string | null;
  name: string | null;
  surname: string | null;
  phone: string | null;
  country: string;
  city: string | null;
  postal_code: string;
  biography: string | null;
  fk_usuarios_id: number;
  created_at?: string;
  stats?: IProfileStats;
  rol?: string;
}

export interface IUploadPhotoResponse {
  photo_url: string;
}

export interface IUpdateProfileRequest {
  username: string;
  photo_url: string | null;
  name: string;
  surname: string;
  phone: string | null;
  country: string;
  city: string;
  postal_code: string;
  biography: string | null;
}

export interface IAdminProfile extends IProfile {
  rol: string;
  status: string;
}

export interface IProfileDetailUser extends IProfile {
  email: string;
  status: string;
  created_at: string;
  last_login: string;
}

export interface IPurchaseSale {
  title: string;
  description: string;
  price: string;
  condition: string;
  status: string;
}

export interface IReview {
  stars: number;
  comentario: string | null;
  created_at: string;
  fk_article_id: number;
  article_title?: string | null;
  reviewer_name?: string | null;
  reviewer_surname?: string | null;
  reviewer_username?: string | null;
}

export interface IReport {
  reason: string;
  comments: string;
  status: string;
  created_at: string;
  fk_articles_id: number;
}

export interface IFavorite extends IArticle {
  favorite_created_at: string;
  fk_articles_id?: number;
  cover?: string | null;
}

export interface IProfileActivity {
  reviews: IReview[];
  favorites: IFavorite[];
}

export interface IAdminProfileDetail {
  user: IProfileDetailUser;
  purchases: IPurchaseSale[];
  sales: IPurchaseSale[];
  reviews: IReview[];
  reports: IReport[];
  favorites: IFavorite[];
}
