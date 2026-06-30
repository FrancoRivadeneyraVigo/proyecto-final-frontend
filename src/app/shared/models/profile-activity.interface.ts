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
    comentario: string;
    created_at: string;
    fk_article_id: number;
}

export interface IReport {
    reason: string;
    comments: string;
    status: string;
    created_at: string;
    fk_articles_id: number;
}

export interface IFavorite {
    created_at: string;
    fk_articles_id: number;
}

export interface IAdminProfileDetail {
    user: IProfileDetailUser;
    purchases: IPurchaseSale[];
    sales: IPurchaseSale[];
    reviews: IReview[];
    reports: IReport[];
    favorites: IFavorite[];
}