import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { AuthService } from '../../services/auth.service';
import { ArticleService } from '../../services/article.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { NavbarComponent } from '../../shared/layout/navbar/navbar.component';
import { FooterComponent } from '../../shared/layout/footer/footer.component';
import { IArticleDetail, IArticleSummary } from '../../shared/models/article.interface';

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

  articleId = '';
  article?: IArticleDetail;
  similarArticles: IArticleSummary[] = [];

  currentImageIndex = 0;

  isLoading = true;
  isDeleting = false;
  errorMessage = '';

  currentUser = this.authService.currentUser;

  async ngOnInit(): Promise<void> {
    this.articleId = this.route.snapshot.paramMap.get('id') ?? '';
    await this.loadArticle();
  }

  get isOwner(): boolean {
    const userId = this.currentUser()?.fk_usuarios_id;
    return !!userId && userId === this.article?.fk_usuarios_id;
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get images(): string[] {
    return this.article?.images?.length ? this.article.images : ['images/hero-watch.webp'];
  }

  get currentImage(): string {
    return this.images[this.currentImageIndex] ?? this.images[0];
  }

  get locationLabel(): string {
    const city = this.article?.city || 'Madrid';
    const country = this.article?.country || 'Spain';
    return `${city}, ${country}`;
  }

  get formattedPrice(): string {
    const price = this.article?.price ?? 0;
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
      this.errorMessage = 'Articulo no encontrado.';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      this.article = await this.articleService.getArticleById(this.articleId);
      this.currentImageIndex = 0;
      this.similarArticles = await this.articleService.getSimilarArticles(this.articleId);
    } catch (_error) {
      this.errorMessage = 'No se pudo cargar este articulo.';
    } finally {
      this.isLoading = false;
    }
  }

  prevImage(): void {
    this.currentImageIndex =
      (this.currentImageIndex - 1 + this.images.length) % this.images.length;
  }

  nextImage(): void {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
  }

  async toggleFavorite(): Promise<void> {
    if (!this.article) {
      return;
    }

    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    const wasFavorite = !!this.article.is_favorite;
    this.article.is_favorite = !wasFavorite;

    try {
      if (wasFavorite) {
        await this.articleService.removeFavorite(this.article.id);
      } else {
        await this.articleService.addFavorite(this.article.id);
      }
    } catch (_error) {
      this.article.is_favorite = wasFavorite;
      toast.error('No se pudo actualizar tus favoritos');
    }
  }

  async onDeleteArticle(): Promise<void> {
    if (!this.article || this.isDeleting) {
      return;
    }

    const confirmed = window.confirm('¿Seguro que quieres eliminar este articulo?');
    if (!confirmed) {
      return;
    }

    this.isDeleting = true;

    try {
      await this.articleService.deleteArticle(this.article.id);
      toast.success('Articulo eliminado correctamente');
      this.router.navigate(['/explore']);
    } catch (_error) {
      toast.error('No se pudo eliminar el articulo');
    } finally {
      this.isDeleting = false;
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
}
