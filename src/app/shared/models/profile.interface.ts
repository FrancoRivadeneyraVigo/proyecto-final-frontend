export interface IProfile {
    id: number;
    username: string;
    rating: string;
    photo_url: string | null;
    name: string;
    surname: string;
    phone: string | null;
    country: string;
    city: string;
    postal_code: string;
    biography: string | null;
    fk_usuarios_id: number;
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
