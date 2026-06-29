export type ArticleCondition =
    | 'NEW'
    | 'VERY_GOOD'
    | 'GOOD'
    | 'USED';

export interface ICreateArticle {
    title: string;
    description: string | null;
    price: number;
    condition: ArticleCondition;
    year_of_manufacture: number;
    case_material: string | null;
    bracelet_material: string | null;
    original_box: boolean;
    original_papers: boolean;
    shipping_available: boolean;
    fk_styles_id: number;
    fk_models_id: number;
    publish?: boolean;
}