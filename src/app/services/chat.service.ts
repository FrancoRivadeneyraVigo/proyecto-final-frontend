import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { IChatMessage, IChatMessagesResponse, IChatSummary, ICreateChatResponse, ISendMessageRequest } from '../shared/models/chat.interface';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private httpClient = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/chats`;

  async getChats(): Promise<IChatSummary[]> {
    const chats = await lastValueFrom(
      this.httpClient.get<IChatSummary[] | null>(this.baseUrl),
    );

    return chats ?? [];
  }

  async createChat(articleId: number | string): Promise<ICreateChatResponse> {
    return lastValueFrom(
      this.httpClient.post<ICreateChatResponse>(this.baseUrl, { fk_articles_id: Number(articleId) }),
    );
  }

  async getChatMessages(chatId: number | string): Promise<IChatMessagesResponse> {
    return lastValueFrom(
      this.httpClient.get<IChatMessagesResponse>(`${this.baseUrl}/${chatId}/mensajes`),
    );
  }

  async sendMessage(chatId: number | string, message: string): Promise<IChatMessage> {
    const body: ISendMessageRequest = { message };

    return lastValueFrom(
      this.httpClient.post<IChatMessage>(`${this.baseUrl}/${chatId}/mensajes`, body),
    );
  }
}

