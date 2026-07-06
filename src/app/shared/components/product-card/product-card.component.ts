import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IArticleSummary } from '../../models/article.interface';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  article = input.required<IArticleSummary>();
  showFavorite = input<boolean>(true);

  favoriteToggled = output<IArticleSummary>();

  get coverImage(): string {
    return this.article().cover || 'images/hero-watch.webp';
  }

  get formattedPrice(): string {
    return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(
      Number(this.article().price),
    );
  }

  get locationLabel(): string {
    const { city, country } = this.article();
    return [city, country].filter(Boolean).join(', ');
  }

  get metaLabel(): string {
    const { year_of_manufacture, condition, diameter_mm } = this.article();
    const labels: Record<string, string> = {
      NEW: 'Nuevo',
      VERY_GOOD: 'Excelente',
      GOOD: 'Buen estado',
      USED: 'Usado',
    };

    return [
      year_of_manufacture || 2021,
      condition ? labels[condition] ?? condition : 'Excelente',
      `${diameter_mm || 41}mm`,
    ].join(' · ');
  }

  onFavoriteClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.favoriteToggled.emit(this.article());
  }
}
