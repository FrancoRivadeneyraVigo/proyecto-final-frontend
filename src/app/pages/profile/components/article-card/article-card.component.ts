import { Component, computed, inject, input, output, signal } from '@angular/core'; 
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component'; 
import { IArticle } from '../../../../shared/models/article.interface';

const STATUS_LABELS: Record<string, string> = {
  PUBLISHED: 'Publicado',
  DRAFT: 'Borrador',
  'UNDER REVIEW': 'En revisión',
  RESERVED: 'Reservado',
  SOLD: 'Vendido',
};

@Component({
  selector: 'app-article-card',
  imports: [ButtonComponent, ConfirmModalComponent, RouterLink],
  templateUrl: './article-card.component.html',
  styleUrl: './article-card.component.css',
})
export class ArticleCardComponent {
  article = input.required<IArticle>();
  isOwner = input(false);

  deleted = output<number>();

  private router = inject(Router);

  // Signal para controlar si mostramos o no el modal en el HTML
  showDeleteModal = signal<boolean>(false);

  statusLabel = computed(() => STATUS_LABELS[this.article().status] ?? this.article().status);

  onEdit(): void {
    this.router.navigate(['/articles', this.article().id, 'edit']);
  }

  // Abre el modal cambiando el estado del signal
  onDelete(): void {
    this.showDeleteModal.set(true);
  }

  // Se ejecuta cuando el usuario hace clic en "Confirmar" dentro del modal
  onConfirmDelete(): void {
    this.deleted.emit(this.article().id);
    this.showDeleteModal.set(false);
  }

  // Se ejecuta si el usuario cancela o cierra el modal
  onCancelDelete(): void {
    this.showDeleteModal.set(false);
  }
}