import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NavbarComponent } from '../../shared/layout/navbar/navbar.component';
import { ArticleService } from '../../services/article.service';
import { IArticleSummary, IArticlesPaginatedResponse } from '../../shared/models/article.interface';

import { Router, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { IBrand } from '../../shared/models/ibrand.interface';
import { BrandService } from '../../services/brand.service';
import { StatsComponent } from './components/stats/stats.component';
import { FooterComponent } from '../../shared/layout/footer/footer.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-home',
  imports: [NavbarComponent, RouterLink, StatsComponent, FooterComponent, ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private articleService = inject(ArticleService);
  private brandService = inject(BrandService);
  private router = inject(Router);

  arrArticles = signal<IArticleSummary[]>([]);
  brands = signal<IBrand[]>([]);
  searchTerm = signal<string>('');

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

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement
    this.searchTerm.set(input.value);
    if (input.value.trim() === '') {
      this.loadArticles()
    }
  }

  async onSearch(): Promise<void> {
    try {
      const term = this.searchTerm().trim();
      if (!term) {
        this.loadArticles();
        return;
      }

      const result = await this.articleService.searchArticles(term)
      this.arrArticles.set(result)

    } catch (error: any) {

      if (error.status == 404) {
        this.arrArticles.set([]);
      } else {
        toast.error(this.getBackendErrorMessage(error, 'Hubo un problema al realizar la búsqueda'));
      }
    }
  }

  ngOnInit() {
    this.loadArticles();
    this.loadBrands();
  }

  async loadArticles() {
    try {
      const response: IArticlesPaginatedResponse<IArticleSummary> = await this.articleService.getAll(3);
      this.arrArticles.set(response.data)

    } catch (error: any) {
      toast.error(this.getBackendErrorMessage(error, 'Hubo un problema al cargar los artículos'));
    }
  }

  async loadBrands() {
    try {
      const response = await this.brandService.getAll();
      const brandIds = [1, 2, 60013, 30002, 4, 7];
      this.brands.set(response.data.filter(b => brandIds.includes(b.id) && b.logo_url));

    } catch (error: any) {
      toast.error(this.getBackendErrorMessage(error, 'Hubo un problema al cargar las marcas'));
    }
  }

  toggleFavorite(article: IArticleSummary) {
    article.is_favorite = !article.is_favorite;

    if (article.is_favorite) {
      toast.success('Has añadido ' + article.title + ' a favoritos');
    } else {
      toast.info('Has quitado ' + article.title + ' de tus favoritos');
    }
  }

}
