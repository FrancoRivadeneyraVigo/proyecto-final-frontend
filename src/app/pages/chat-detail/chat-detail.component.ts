import { DatePipe } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/chat.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { NavbarComponent } from '../../shared/layout/navbar/navbar.component';
import { IChatArticleDetail, IChatDetail, IChatMessage } from '../../shared/models/chat.interface';

@Component({
  selector: 'app-chat-detail',
  imports: [DatePipe, ReactiveFormsModule, RouterLink, ButtonComponent, NavbarComponent],
  templateUrl: './chat-detail.component.html',
  styleUrl: './chat-detail.component.css',
})
export class ChatDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private chatService = inject(ChatService);
  private authService = inject(AuthService);

  @ViewChild('messagesEnd') messagesEnd?: ElementRef<HTMLDivElement>;

  chatId = '';
  chat?: IChatDetail;
  messages: IChatMessage[] = [];
  isLoading = true;
  isSending = false;
  errorMessage = '';

  messageForm = new FormGroup({
    message: new FormControl('', [
      Validators.required,
      Validators.maxLength(2000),
    ]),
  });

  async ngOnInit(): Promise<void> {
    this.chatId = this.route.snapshot.paramMap.get('id') ?? '';
    await this.loadMessages();
  }

  get currentUserId(): number | null {
    return this.authService.currentUser()?.fk_usuarios_id ?? null;
  }

  get article(): IChatArticleDetail | null {
    return this.chat?.article ?? null;
  }

  get contactName(): string {
    return this.chat?.contact_name || 'Ana Garcia';
  }

  get contactInitials(): string {
    return this.contactName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'AG';
  }

  get articleTitle(): string {
    return this.article?.title || 'Title';
  }

  get articleDescription(): string {
    return this.article?.description
      || 'Lorem ipsum dolor sit amet consectetur. Erat mauris sit sed ut eget. Lectus interdum urna';
  }

  get articlePrice(): string {
    const price = this.article?.price ?? 12500;
    return new Intl.NumberFormat('es-ES', {
      maximumFractionDigits: 0,
    }).format(Number(price));
  }

  get articleImage(): string {
    const cover = this.article?.cover;

    if (!cover) {
      return 'images/hero-watch.webp';
    }

    if (cover.startsWith('http') || cover.startsWith('images/')) {
      return cover;
    }

    return `${environment.apiUrl.replace('/api', '')}${cover.startsWith('/') ? cover : `/${cover}`}`;
  }

  isOwnMessage(message: IChatMessage): boolean {
    return Number(message.fk_sender_id) === Number(this.currentUserId);
  }

  getConditionLabel(condition?: string | null): string {
    const labels: Record<string, string> = {
      NEW: 'Nuevo',
      VERY_GOOD: 'Como nuevo',
      GOOD: 'Buen estado',
      USED: 'Usado',
    };

    return condition ? labels[condition] ?? condition : 'Como nuevo';
  }

  getStatusLabel(status?: string | null): string {
    const labels: Record<string, string> = {
      DRAFT: 'Borrador',
      PUBLISHED: 'Publicado',
      UNDER_REVIEW: 'En revision',
      SOLD: 'Vendido',
      RESERVED: 'Reservado',
      RETIRED: 'Retirado',
    };

    return status ? labels[status] ?? status : 'Vendido';
  }

  async loadMessages(): Promise<void> {
    if (!this.chatId) {
      this.errorMessage = 'Chat no encontrado.';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const result = await this.chatService.getChatMessages(this.chatId);
      this.chat = result.chat;
      this.messages = result.messages ?? [];
      this.scrollToBottom();
    } catch (_error) {
      this.errorMessage = 'No se pudo cargar este chat.';
    } finally {
      this.isLoading = false;
    }
  }

  async sendMessage(): Promise<void> {
    if (this.messageForm.invalid || this.isSending) {
      this.messageForm.markAllAsTouched();
      return;
    }

    const message = this.messageForm.value.message?.trim() ?? '';
    if (!message) {
      return;
    }

    this.isSending = true;

    try {
      const createdMessage = await this.chatService.sendMessage(this.chatId, message);
      this.messages = [...this.messages, createdMessage];
      this.messageForm.reset();
      this.scrollToBottom();
    } catch (_error) {
      toast.error('No se pudo enviar el mensaje');
    } finally {
      this.isSending = false;
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      this.messagesEnd?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  }
}
