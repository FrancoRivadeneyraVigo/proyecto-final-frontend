import { Component, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { ArticleService } from '../../../../services/article.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { IFavorite } from '../../../../shared/models/profile-activity.interface';
import { getHttpErrorMessage } from '../../../../shared/utils/http-error-message';

@Component({
  selector: 'app-favorites',
  imports: [ButtonComponent],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css',
})
export class FavoritesComponent {
  favorites = input<IFavorite[]>([]);
  loading = input(false);
  error = input<string | null>(null);

  changed = output<void>();

  private articleService = inject(ArticleService);
  private router = inject(Router);

  async removeFavorite(article: IFavorite, event: Event): Promise<void> {
    event.stopPropagation();

    try {
      await this.articleService.removeFavorite(article.id);
      toast.success('Favorito eliminado correctamente');
      this.changed.emit();
    } catch (error) {
      toast.error(getHttpErrorMessage(error, 'No se pudo eliminar el favorito'));
    }
  }

  openArticle(article: IFavorite): void {
    this.router.navigate(['/articles', article.id]);
  }

  favoriteDate(article: IFavorite): string {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(article.favorite_created_at));
  }
}