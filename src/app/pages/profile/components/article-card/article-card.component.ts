import { Component, computed, input } from '@angular/core';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { IArticle } from '../../../../shared/models/article.interface';

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

  initials = computed(() => {
    const words = this.article().title.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    return this.article().title.slice(0, 2).toUpperCase();
  });

  statusLabel = computed(() => STATUS_LABELS[this.article().status] ?? this.article().status);
}
