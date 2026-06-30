export interface IBrand {
    id: number;
    name: string;
    country: string;
    logo_url: string | null;
}

export interface IBrandsResponse {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    data: IBrand[];
}