
export interface IBrand {
    id: number;
    name: string;
    logo_url: string;
}

export interface IBrandResponse {
    page:number;
    per_page: number;
    total: number;
    total_pages:number;
    data: IBrand[]
}