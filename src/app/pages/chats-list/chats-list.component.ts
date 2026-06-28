import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { NavbarComponent } from '../../shared/layout/navbar/navbar.component';
import { IChatSummary } from '../../shared/models/chat.interface';

type ChatMode = 'sales' | 'purchases';
type ChatFilter = 'PUBLISHED' | 'RESERVED' | 'SOLD' | 'BOUGHT' | 'NOT_BOUGHT' | 'ALL';

@Component({
  selector: 'app-chats-list',
  imports: [DatePipe, RouterLink, ButtonComponent, NavbarComponent],
  templateUrl: './chats-list.component.html',
  styleUrl: './chats-list.component.css',
})
export class ChatsListComponent implements OnInit {
  private chatService = inject(ChatService);

  chats = signal<IChatSummary[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');
  activeMode = signal<ChatMode>('sales');
  activeFilter = signal<ChatFilter>('PUBLISHED');

  visibleChats = computed(() => {
    const mode = this.activeMode();
    const filter = this.activeFilter();

    return this.chats().filter((chat) => {
      const role = this.chatRole(chat);
      const matchesMode = role ? (mode === 'sales' ? role === 'SELLER' : role === 'BUYER') : true;
      const matchesFilter = filter === 'ALL' || this.chatStatus(chat) === filter;
      return matchesMode && matchesFilter;
    });
  });

  async ngOnInit(): Promise<void> {
    await this.loadChats();
  }

  async loadChats(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      this.chats.set(await this.chatService.getChats());
    } catch (_error) {
      this.errorMessage.set('No se pudieron cargar tus chats.');
    } finally {
      this.isLoading.set(false);
    }
  }

  setMode(mode: ChatMode): void {
    this.activeMode.set(mode);
    this.activeFilter.set(mode === 'sales' ? 'PUBLISHED' : 'BOUGHT');
  }

  setFilter(filter: ChatFilter): void {
    this.activeFilter.set(filter);
  }

  chatId(chat: IChatSummary): number {
    return chat.id ?? chat.chat_id;
  }

  chatRole(chat: IChatSummary): 'BUYER' | 'SELLER' | null {
    return chat.my_role ?? null;
  }

  chatStatus(chat: IChatSummary): ChatFilter {
    if (chat.article_status) {
      return chat.article_status;
    }

    return this.chatRole(chat) === 'BUYER' ? 'BOUGHT' : 'PUBLISHED';
  }

  statusLabel(chat: IChatSummary): string {
    const labels: Record<ChatFilter, string> = {
      PUBLISHED: 'Publicado',
      RESERVED: 'Reservado',
      SOLD: 'Vendido',
      BOUGHT: 'Comprado',
      NOT_BOUGHT: 'No comprado',
      ALL: 'Todos',
    };

    return labels[this.chatStatus(chat)] ?? 'Publicado';
  }

  statusClass(chat: IChatSummary): string {
    return this.chatStatus(chat).toLowerCase().replace('_', '-');
  }

  contactName(chat: IChatSummary): string {
    return chat.contact_username || chat.contact_name || chat.buyer_name || 'Ana Garcia';
  }

  chatDate(chat: IChatSummary): string {
    return chat.last_message_at || chat.created_at;
  }

  chatPreview(chat: IChatSummary): string {
    return chat.last_message || 'Lorem ipsum dolor sit amet consectetur. Erat mauris ut sed ut eget.';
  }

  chatImage(chat: IChatSummary): string {
    return chat.article_cover || 'images/hero-watch.webp';
  }
}
