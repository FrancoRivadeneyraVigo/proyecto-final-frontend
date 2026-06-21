import { IProfile } from './profile.interface';

export interface IAuthUser {
    id: number;
    email: string;
    rol: string;
    status: string;
    created_at: string;
    last_login: string;
}

export interface ILoginRequest {
    email: string;
    password: string;
}

export interface ILoginResponse {
    token: string;
    user: IAuthUser;
}

export interface IRole {
    id: number;
    name: string;
}

export interface IMeResponse {
    id: number;
    email: string;
    status: string;
    created_at: string;
    update_at: string;
    last_login: string;
    rol: string;
    profile: IProfile;
    roles: IRole[];
}