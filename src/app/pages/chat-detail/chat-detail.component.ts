import { DatePipe } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/chat.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { NavbarComponent } from '../../shared/layout/navbar/navbar.component';
import { IChatMessage } from '../../shared/models/chat.interface';

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

  isOwnMessage(message: IChatMessage): boolean {
    return Number(message.fk_sender_id) === Number(this.currentUserId);
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
