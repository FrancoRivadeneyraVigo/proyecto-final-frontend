export type ArticleStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'UNDER REVIEW'
  | 'RESERVED'
  | 'SOLD';

export interface IArticle {
  id: number;
  title: string;
  description: string;
  price: string;
  condition: string;
  year_of_manufacture: number;
  case_material: string;
  bracelet_material: string;
  original_box: number;
  original_papers: number;
  status: ArticleStatus;
  shipping_available: number;
  published_at: string | null;
  fk_users_id: number;
  fk_buyer_id: number | null;
  fk_styles_id: number;
  fk_models_id: number;
}

export interface IArticlesPaginatedResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: IArticle[];
}
