import { Component, input, output } from '@angular/core';
import { IArticle } from '../../../../shared/models/article.interface';
import { ArticleCardComponent } from '../article-card/article-card.component';

@Component({
  selector: 'app-article-list',
  imports: [ArticleCardComponent],
  templateUrl: './article-list.component.html',
  styleUrl: './article-list.component.css',
})
export class ArticleListComponent {
  articles = input.required<IArticle[]>();
  total = input.required<number>();
  isOwner = input(false);

  deleted = output<number>();
}
