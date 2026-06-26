import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { IArticlesPaginatedResponse } from '../../../../shared/models/article.interface';
import { ArticleService } from '../../../../services/article.service';
import { ArticleListComponent } from '../article-list/article-list.component';
import { ArticleStatusFilterComponent } from '../article-status-filter/article-status-filter.component';

const EMPTY_MESSAGES: Record<string, string> = {
  published: 'No tienes anuncios publicados.',
  draft: 'No tienes borradores.',
  under_review: 'No tienes anuncios en revisión.',
  reserved: 'No tienes anuncios reservados.',
  sold: 'No tienes anuncios vendidos.',
  all: 'No tienes anuncios.',
};

@Component({
  selector: 'app-my-articles',
  imports: [ArticleStatusFilterComponent, ArticleListComponent],
  templateUrl: './my-articles.component.html',
  styleUrl: './my-articles.component.css',
})
export class MyArticlesComponent implements OnInit {
  userId = input.required<string>();

  private articleService = inject(ArticleService);

  response = signal<IArticlesPaginatedResponse | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  activeStatus = signal('published');

  emptyMessage = computed(
    () => EMPTY_MESSAGES[this.activeStatus()] ?? 'No tienes anuncios.'
  );

  async ngOnInit(): Promise<void> {
    await this.loadArticles();
  }

  async onStatusChange(status: string): Promise<void> {
    this.activeStatus.set(status);
    await this.loadArticles();
  }

  private async loadArticles(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const result = await this.articleService.getByUserId(
        this.userId(),
        this.activeStatus()
      );
      this.response.set(result);
    } catch {
      this.error.set('No se pudieron cargar los artículos. Inténtalo de nuevo más tarde.');
      this.response.set(null);
    } finally {
      this.loading.set(false);
    }
  }
}
