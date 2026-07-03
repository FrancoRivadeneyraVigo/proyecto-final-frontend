import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

export interface ArticleStatusFilter {
  label: string;
  value: string;
}

export const ARTICLE_STATUS_FILTERS: ArticleStatusFilter[] = [
  { label: 'Publicados', value: 'published' },
  { label: 'Borradores', value: 'draft' },
  { label: 'En revisión', value: 'under review' },
  { label: 'Reservados', value: 'reserved' },
  { label: 'Vendidos', value: 'sold' },
  { label: 'Todos', value: 'all' },
];

@Component({
  selector: 'app-article-status-filter',
  imports: [ButtonComponent],
  templateUrl: './article-status-filter.component.html',
  styleUrl: './article-status-filter.component.css',
})
export class ArticleStatusFilterComponent {
  activeStatus = input<string>('published');
  statusChange = output<string>();

  filters = ARTICLE_STATUS_FILTERS;

  onFilterClick(filter: ArticleStatusFilter): void {
    this.statusChange.emit(filter.value);
  }
}
