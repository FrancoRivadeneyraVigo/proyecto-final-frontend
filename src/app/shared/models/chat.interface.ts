export type ChatArticleStatus = 'PUBLISHED' | 'RESERVED' | 'SOLD' | 'BOUGHT' | 'NOT_BOUGHT' | 'ALL';

export interface IChatSummary {
    id: number;
    chat_id: number;
    created_at: string;
    article_id?: number;
    article_title: string;
    article_price: number | string;
    article_cover?: string | null;
    article_status?: ChatArticleStatus;
    buyer_name: string;
    contact_name?: string | null;
    contact_username?: string | null;
    contact_photo?: string | null;
    my_role?: 'BUYER' | 'SELLER' | null;
    last_message?: string | null;
    last_message_at?: string | null;
    last_sender_id?: number | null;
    unread_count?: number;
}

export interface IChatMessage {
    id: number;
    message: string;
    created_at: string;
    is_read: number | boolean;
    fk_chats_id: number;
    fk_sender_id: number;
}

export interface IChatArticleDetail {
    id: number;
    title: string;
    description?: string | null;
    price: number | string;
    status?: ChatArticleStatus | string | null;
    condition?: string | null;
    year_of_manufacture?: number | null;
    cover?: string | null;
    reference?: string | null;
    movement_type?: string | null;
    style_name?: string | null;
}

export interface IChatDetail {
    id: number;
    created_at?: string | null;
    contact_id?: number | null;
    contact_name?: string | null;
    contact_photo?: string | null;
    can_manage_article?: boolean;
    my_role?: 'BUYER' | 'SELLER' | null;
    buyer_id?: number | null;
    seller_id?: number | null;
    has_reviewed?: boolean;
    article?: IChatArticleDetail | null;
}

export interface IChatMessagesResponse {
    chatId: number | string;
    chat?: IChatDetail;
    messages: IChatMessage[];
}

export interface ICreateChatResponse {
    id: number;
    message: string;
}

export interface ISendMessageRequest {
    message: string;
}
