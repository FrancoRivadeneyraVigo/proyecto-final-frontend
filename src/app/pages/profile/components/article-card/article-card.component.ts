import { Component, computed, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { IArticle } from '../../../../shared/models/article.interface';
import Swal from 'sweetalert2';

const STATUS_LABELS: Record<string, string> = {
  PUBLISHED: 'Publicado',
  DRAFT: 'Borrador',
  UNDER_REVIEW: 'En revisión',
  RESERVED: 'Reservado',
  SOLD: 'Vendido',
};

@Component({
  selector: 'app-article-card',
  imports: [ButtonComponent],
  templateUrl: './article-card.component.html',
  styleUrl: './article-card.component.css',
})
export class ArticleCardComponent {
  article = input.required<IArticle>();
  isOwner = input(false);

  deleted = output<number>();

  private router = inject(Router);

  initials = computed(() => {
    const words = this.article().title.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    return this.article().title.slice(0, 2).toUpperCase();
  });

  statusLabel = computed(() => STATUS_LABELS[this.article().status] ?? this.article().status);

  onEdit(): void {
    this.router.navigate(['/articles', this.article().id, 'edit']);
  }

  async onDelete(): Promise<void> {

    const result = await Swal.fire({
      title: 'Eliminar artículo',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545'
    });

    if (!result.isConfirmed) {
      return;
    }

    this.deleted.emit(this.article().id);
  }
}
