import { Component, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/chat.service';
import { ArticleService } from '../../services/article.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { NavbarComponent } from '../../shared/layout/navbar/navbar.component';
import { FooterComponent } from '../../shared/layout/footer/footer.component';
import { IArticleDetail, IArticleSummary } from '../../shared/models/article.interface';
import { getHttpErrorMessage } from '../../shared/utils/http-error-message';
import { ReportArticleComponent } from './report-article/report-article.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-article-detail',
  imports: [RouterLink, ButtonComponent, ProductCardComponent, NavbarComponent, FooterComponent, ReportArticleComponent],
  templateUrl: './article-detail.component.html',
  styleUrl: './article-detail.component.css',
})
export class ArticleDetailComponent implements OnInit {
  @ViewChild(ReportArticleComponent) reportArticleModal?: ReportArticleComponent;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private articleService = inject(ArticleService);
  private chatService = inject(ChatService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  articleId = 0;

  article = signal<IArticleDetail | undefined>(undefined);
  similarArticles = signal<IArticleSummary[]>([]);
  currentImageIndex = signal(0);

  isLoading = signal(true);
  isDeleting = signal(false);
  isContacting = signal(false);
  errorMessage = signal('');

  currentUser = this.authService.currentUser;

ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
        const idParam = params.get('id');
        this.articleId = idParam ? Number(idParam) : 0;
        this.loadArticle();
    });
}

  get isOwner(): boolean {
    const userId = this.currentUser()?.fk_usuarios_id;
    return !!userId && userId === this.article()?.fk_users_id;
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get images(): string[] {
    const article = this.article();
    const urls = article?.images?.map((image) => image.image_url) ?? [];
    return urls.length ? urls : ['images/hero-watch.webp'];
  }

  get currentImage(): string {
    return this.images[this.currentImageIndex()] ?? this.images[0];
  }

  get locationLabel(): string {
    const city = this.article()?.city;
    const country = this.article()?.country;
    return [city, country].filter(Boolean).join(', ');
  }

  get formattedPrice(): string {
    const price = this.article()?.price ?? 0;
    return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(Number(price));
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

  // El backend devuelve { message, error } en sus respuestas de error.
  private getBackendErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const backendError = error.error;

      if (typeof backendError === 'string') {
        return backendError;
      }

      if (Array.isArray(backendError)) {
        return backendError.join(', ');
      }

      return backendError?.message || backendError?.error || fallback;
    }

    return fallback;
  }

  async loadArticle(): Promise<void> {
    // Si el ID es 0 o no es válido, manejamos el error
    if (!this.articleId) {
      this.errorMessage.set('Articulo no encontrado.');
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const article = await this.articleService.getArticleById(this.articleId);
      this.article.set(article);
      this.currentImageIndex.set(0);
    } catch (error) {
      this.errorMessage.set(this.getBackendErrorMessage(error, 'No se pudo cargar este articulo.'));
      this.isLoading.set(false);
      return;
    }

    try {
      const similar = await this.articleService.getSimilarArticles(this.articleId);
      console.debug('Similar articles response for', this.articleId, similar);
      this.similarArticles.set(similar);
    } catch (e) {
      console.warn('Error loading similar articles for', this.articleId, e);
      this.similarArticles.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  prevImage(): void {
    const length = this.images.length;
    this.currentImageIndex.set((this.currentImageIndex() - 1 + length) % length);
  }

  nextImage(): void {
    const length = this.images.length;
    this.currentImageIndex.set((this.currentImageIndex() + 1) % length);
  }

  async toggleFavorite(): Promise<void> {
    const article = this.article();
    if (!article) {
      return;
    }

    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    const wasFavorite = !!article.is_favorite;
    this.article.set({ ...article, is_favorite: !wasFavorite });

    try {
      if (wasFavorite) {
        await this.articleService.removeFavorite(article.id);
      } else {
        await this.articleService.addFavorite(article.id);
      }
    } catch (error) {
      this.article.set({ ...article, is_favorite: wasFavorite });
      toast.error(this.getBackendErrorMessage(error, 'No se pudo actualizar tus favoritos'));
    }
  }

  async onDeleteArticle(): Promise<void> {
    const article = this.article();
    if (!article || this.isDeleting()) {
      return;
    }

    const confirmed = window.confirm('¿Seguro que quieres eliminar este articulo?');
    if (!confirmed) {
      return;
    }

    this.isDeleting.set(true);

    try {
      await this.articleService.deleteArticle(article.id);
      toast.success('Articulo eliminado correctamente');
      this.router.navigate(['/explore']);
    } catch (error) {
      toast.error(this.getBackendErrorMessage(error, 'No se pudo eliminar el articulo'));
    } finally {
      this.isDeleting.set(false);
    }
  }

  onEditArticle(): void {
    this.router.navigate(['/articles', this.articleId, 'edit']);
  }

  async onContact(): Promise<void> {
    const article = this.article();
    if (!article || this.isContacting()) {
      return;
    }

    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    this.isContacting.set(true);

    try {
      const chat = await this.chatService.createChat(article.id);
      this.router.navigate(['/chats', chat.id]);
    } catch (error) {
      toast.error(getHttpErrorMessage(error, 'No se pudo abrir el chat'));
    } finally {
      this.isContacting.set(false);
    }
  }

  onReportArticle(): void {
    this.reportArticleModal?.open();
  }

  async onSimilarFavoriteToggled(summary: IArticleSummary): Promise<void> {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    const wasFavorite = !!summary.is_favorite;
    const updated = this.similarArticles().map((item) =>
      item.id === summary.id ? { ...item, is_favorite: !wasFavorite } : item,
    );
    this.similarArticles.set(updated);

    try {
      if (wasFavorite) {
        await this.articleService.removeFavorite(summary.id);
      } else {
        await this.articleService.addFavorite(summary.id);
      }
    } catch (error) {
      const reverted = this.similarArticles().map((item) =>
        item.id === summary.id ? { ...item, is_favorite: wasFavorite } : item,
      );
      this.similarArticles.set(reverted);
      toast.error(this.getBackendErrorMessage(error, 'No se pudo actualizar tus favoritos'));
    }
  }
}