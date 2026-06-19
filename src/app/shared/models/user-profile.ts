export interface UserProfile {
    id: number;
    email: string;
    status: string;
    created_at: string;
    last_login: string;
    username: string;
    name: string;
    surname: string;
    photo_url: string | null;
    phone: string | null;
    country: string;
    city: string;
    postal_code: string;
    biography: string | null;
    rating: number;
}
