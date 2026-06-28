import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { NavbarComponent } from '../../shared/layout/navbar/navbar.component';
import { IChatSummary } from '../../shared/models/chat.interface';

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
}

