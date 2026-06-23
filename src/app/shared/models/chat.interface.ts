export interface IChatSummary {
    id: number;
    created_at: string;
    article_title: string;
    article_price: number | string;
    buyer_name: string;
}

export interface IChatMessage {
    id: number;
    message: string;
    created_at: string;
    is_read: number | boolean;
    fk_chats_id: number;
    fk_sender_id: number;
}

export interface IChatMessagesResponse {
    chatId: number | string;
    messages: IChatMessage[];
}

export interface ISendMessageRequest {
    message: string;
}
