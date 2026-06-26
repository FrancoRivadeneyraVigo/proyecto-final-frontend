import { Component, input, signal } from '@angular/core';
import { FavoritesComponent } from '../favorites/favorites.component';
import { MyArticlesComponent } from '../my-articles/my-articles.component';
import { RatingsComponent } from '../ratings/ratings.component';

type ActivityTab = 'articles' | 'ratings' | 'favorites';

@Component({
  selector: 'app-profile-activity-tabs',
  imports: [MyArticlesComponent, RatingsComponent, FavoritesComponent],
  templateUrl: './profile-activity-tabs.component.html',
  styleUrl: './profile-activity-tabs.component.css',
})
export class ProfileActivityTabsComponent {
  userId = input.required<string>();

  activeTab = signal<ActivityTab>('articles');

  setActiveTab(tab: ActivityTab): void {
    this.activeTab.set(tab);
  }
}
