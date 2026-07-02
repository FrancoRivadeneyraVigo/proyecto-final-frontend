import { DatePipe } from '@angular/common';
import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { ArticleService } from '../../services/article.service';
import { ChatService } from '../../services/chat.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { NavbarComponent } from '../../shared/layout/navbar/navbar.component';
import { ChatArticleStatus, IChatArticleDetail, IChatDetail, IChatMessage } from '../../shared/models/chat.interface';
import { getHttpErrorMessage } from '../../shared/utils/http-error-message';
import { ReportArticleComponent } from '../article-detail/report-article/report-article.component';

@Component({
  selector: 'app-chat-detail',
  imports: [DatePipe, ReactiveFormsModule, RouterLink, ButtonComponent, NavbarComponent, ReportArticleComponent],
  templateUrl: './chat-detail.component.html',
  styleUrl: './chat-detail.component.css',
})
export class ChatDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private chatService = inject(ChatService);
  private articleService = inject(ArticleService);
  private authService = inject(AuthService);

  @ViewChild('messagesEnd') messagesEnd?: ElementRef<HTMLDivElement>;
  @ViewChild(ReportArticleComponent) reportArticleModal?: ReportArticleComponent;

  chatId = '';
  chat = signal<IChatDetail | undefined>(undefined);
  messages = signal<IChatMessage[]>([]);
  isLoading = signal(true);
  isSending = signal(false);
  isUpdatingArticle = signal(false);
  errorMessage = signal('');

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
    return this.chat()?.article ?? null;
  }
  get canManageArticle(): boolean {
    return this.chat()?.can_manage_article === true;
  }

  get articleStatus(): string | null {
    return this.article?.status ?? null;
  }

  get showReserveAction(): boolean {
    return this.canManageArticle && this.articleStatus === 'PUBLISHED';
  }

  get showReservedActions(): boolean {
    return this.canManageArticle && this.articleStatus === 'RESERVED';
  }

  get showReportArticleAction(): boolean {
    return this.articleStatus === 'SOLD';
  }

  get contactName(): string {
    return this.chat()?.contact_name || 'Ana Garcia';
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
      this.errorMessage.set('Chat no encontrado.');
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const result = await this.chatService.getChatMessages(this.chatId);
      this.chat.set(result.chat);
      this.messages.set(result.messages ?? []);
      this.scrollToBottom();
    } catch (error) {
      this.errorMessage.set(getHttpErrorMessage(error, 'No se pudo cargar este chat.'));
    } finally {
      this.isLoading.set(false);
    }
  }

  async sendMessage(): Promise<void> {
    if (this.messageForm.invalid || this.isSending()) {
      this.messageForm.markAllAsTouched();
      return;
    }

    const message = this.messageForm.value.message?.trim() ?? '';
    if (!message) {
      return;
    }

    this.isSending.set(true);

    try {
      const createdMessage = await this.chatService.sendMessage(this.chatId, message);
      this.messages.set([...this.messages(), createdMessage]);
      this.messageForm.reset();
      this.scrollToBottom();
    } catch (_error) {
      toast.error('No se pudo enviar el mensaje');
    } finally {
      this.isSending.set(false);
    }
  }


  async updateArticleStatus(action: 'reserved' | 'published' | 'sold'): Promise<void> {
    const currentArticle = this.article;
    if (!currentArticle || this.isUpdatingArticle()) {
      return;
    }

    this.isUpdatingArticle.set(true);

    try {
      const response = action === 'reserved'
        ? await this.articleService.markAsReserved(currentArticle.id)
        : action === 'published'
          ? await this.articleService.markAsPublished(currentArticle.id)
          : await this.articleService.markAsSold(currentArticle.id);

      this.setArticleStatus(response.article.status as ChatArticleStatus);

      const messages: Record<typeof action, string> = {
        reserved: 'El producto se ha marcado como reservado.',
        published: 'El producto vuelve a estar publicado.',
        sold: 'El producto se ha marcado como vendido.',
      };
      toast.success(messages[action]);
    } catch (error) {
      toast.error(getHttpErrorMessage(error, 'No se pudo actualizar el estado del producto.'));
    } finally {
      this.isUpdatingArticle.set(false);
    }
  }

  private setArticleStatus(status: ChatArticleStatus | string | null | undefined): void {
    const currentChat = this.chat();
    if (!currentChat?.article || !status) {
      return;
    }

    this.chat.set({
      ...currentChat,
      article: {
        ...currentChat.article,
        status,
      },
    });
  }
  onReportArticle(): void {
    if (!this.article) {
      toast.error('No se puede reportar este producto ahora mismo.');
      return;
    }

    this.reportArticleModal?.open();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      this.messagesEnd?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  }
}

