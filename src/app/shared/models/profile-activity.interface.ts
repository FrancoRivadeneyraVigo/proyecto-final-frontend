import { IArticle } from './article.interface';
import { IProfileDetailUser } from './profile.interface';

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