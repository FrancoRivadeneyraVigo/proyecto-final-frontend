import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { AuthService } from '../../services/auth.service';
import { ArticleService } from '../../services/article-detail.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { NavbarComponent } from '../../shared/layout/navbar/navbar.component';
import { FooterComponent } from '../../shared/layout/footer/footer.component';
import { IArticleDetail, IArticleSummary } from '../../shared/models/article-detail.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-article-detail',
  imports: [RouterLink, ButtonComponent, ProductCardComponent, NavbarComponent, FooterComponent],
  templateUrl: './article-detail.component.html',
  styleUrl: './article-detail.component.css',
})
export class ArticleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private articleService = inject(ArticleService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  articleId = '';

  // App zoneless (sin zone.js): el estado que pinta la plantilla DEBE ser signal,
  // si no, Angular no se entera de que cambió tras un await y no repinta.
  article = signal<IArticleDetail | undefined>(undefined);
  similarArticles = signal<IArticleSummary[]>([]);
  currentImageIndex = signal(0);

  isLoading = signal(true);
  isDeleting = signal(false);
  errorMessage = signal('');

  currentUser = this.authService.currentUser;

  async ngOnInit(): Promise<void> {
    // Si vienes de otro /articles/:id (p.ej. clic en "Relojes similares"),
    // Angular reutiliza este mismo componente y NO vuelve a llamar a ngOnInit.
    // Por eso hay que escuchar los cambios de paramMap explícitamente.
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.articleId = params.get('id') ?? '';
      this.loadArticle();
    });
  }

  get isOwner(): boolean {
    const userId = this.currentUser()?.fk_usuarios_id;
    return !!userId && userId === this.article()?.fk_usuarios_id;
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get images(): string[] {
    const article = this.article();
    return article?.images?.length ? article.images : ['images/hero-watch.webp'];
  }

  get currentImage(): string {
    return this.images[this.currentImageIndex()] ?? this.images[0];
  }

  get locationLabel(): string {
    const city = this.article()?.city || 'Madrid';
    const country = this.article()?.country || 'Spain';
    return `${city}, ${country}`;
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

  async loadArticle(): Promise<void> {
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
    } catch (_error) {
      this.errorMessage.set('No se pudo cargar este articulo.');
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(false);

    // Los relojes similares son un extra: si fallan, no deben tumbar la página de detalle.
    const similar = await this.articleService.getSimilarArticles(this.articleId);
    this.similarArticles.set(similar);
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
    } catch (_error) {
      this.article.set({ ...article, is_favorite: wasFavorite });
      toast.error('No se pudo actualizar tus favoritos');
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
    } catch (_error) {
      toast.error('No se pudo eliminar el articulo');
    } finally {
      this.isDeleting.set(false);
    }
  }

  onEditArticle(): void {
    this.router.navigate(['/sell-item'], { queryParams: { id: this.articleId } });
  }

  onContact(): void {
    this.router.navigate(['/chats']);
  }

  onReportArticle(): void {
    toast.success('Gracias, hemos recibido tu reporte sobre este articulo.');
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
    } catch (_error) {
      const reverted = this.similarArticles().map((item) =>
        item.id === summary.id ? { ...item, is_favorite: wasFavorite } : item,
      );
      this.similarArticles.set(reverted);
      toast.error('No se pudo actualizar tus favoritos');
    }
  }
}