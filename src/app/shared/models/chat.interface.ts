export interface IChatSummary {
    id: number;
    created_at: string;
    article_title: string;
    article_price: number | string;
    buyer_name: string;
    contact_name?: string | null;
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
    status?: string | null;
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
    contact_name?: string | null;
    contact_photo?: string | null;
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

