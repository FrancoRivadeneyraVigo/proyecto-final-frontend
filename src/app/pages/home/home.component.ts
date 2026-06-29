import { Component, inject, OnInit, signal } from '@angular/core';
import { NavbarComponent } from '../../shared/layout/navbar/navbar.component';
import { ArticleService } from '../../services/article.service';
import { IArticlesPaginatedResponse, IArticlesWithFavorite } from '../../shared/models/article.interface';

import { RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { IBrand } from '../../shared/models/brand.interface';
import { BrandService } from '../../services/brand.service';
import { StatsComponent } from './components/stats/stats.component';
import { FooterComponent } from '../../shared/layout/footer/footer.component';

@Component({
  selector: 'app-home',
  imports: [NavbarComponent, RouterLink, StatsComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {

  private articleService = inject(ArticleService);
  private brandService = inject(BrandService)
  arrArticles = signal<IArticlesWithFavorite[]>([]);
  brands = signal<IBrand[]>([]);
  limit = signal<number>(6)
  searchTerm = signal<string>('');

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
      this.arrArticles.set(result.map(article => ({
        ...article, isFavorite: false
      })));


    } catch (error) {
      console.error('Error al buscar:', error)
    }
  }

  ngOnInit() {
    this.loadArticles();
    this.loadBrands();
  }

  async loadArticles() {
    try {
      const response: IArticlesPaginatedResponse = await this.articleService.getAll(3);
      this.arrArticles.set(response.data.map(article => ({ 
        ...article, 
        isFavorite: false,
      })));

    } catch (error) {
      console.error('Error al cargar los articulos:', error);
    }
  }

  async loadBrands() {
    try{
      const response = await this.brandService.getAll(1, this.limit());

      this.brands.set(response.data);
    }catch (error) {
      console.error('Error al cargar las marcas:', error)
    }
  }

  toggleFavorite(article: IArticlesWithFavorite) {
    article.isFavorite = !article.isFavorite;

    if (article.isFavorite) {
      toast.success('Has añadido ' + article.title + ' a favoritos');
    } else {
      toast.info('Has quitado ' + article.title + ' de tus favoritos');
    }
  }


}
