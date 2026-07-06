import { Component, computed, input, output } from '@angular/core';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

export interface ArticleStatusFilter {
  label: string;
  value: string;
  ownerOnly?: boolean;
}

export const ARTICLE_STATUS_FILTERS: ArticleStatusFilter[] = [
  { label: 'Publicados', value: 'published' },
  { label: 'Borradores', value: 'draft', ownerOnly: true },
  { label: 'En revisión', value: 'under review', ownerOnly: true },
  { label: 'Reservados', value: 'reserved' },
  { label: 'Vendidos', value: 'sold' },
  { label: 'Todos', value: 'all', ownerOnly: true },
];

@Component({
  selector: 'app-article-status-filter',
  imports: [ButtonComponent],
  templateUrl: './article-status-filter.component.html',
  styleUrl: './article-status-filter.component.css',
})
export class ArticleStatusFilterComponent {
  activeStatus = input<string>('published');
  isOwner = input(false);
  statusChange = output<string>();

  visibleFilters = computed(() =>
    ARTICLE_STATUS_FILTERS.filter((filter) => !filter.ownerOnly || this.isOwner())
  );

  onFilterClick(filter: ArticleStatusFilter): void {
    this.statusChange.emit(filter.value);
  }
}
