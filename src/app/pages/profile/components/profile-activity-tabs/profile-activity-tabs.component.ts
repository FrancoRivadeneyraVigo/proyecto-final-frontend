import { Component, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { FavoritesComponent } from '../favorites/favorites.component';
import { MyArticlesComponent } from '../my-articles/my-articles.component';
import { RatingsComponent } from '../ratings/ratings.component';
import { ProfileService } from '../../../../services/profile.service';
import { IFavorite, IReview } from '../../../../shared/models/profile.interface';

type ActivityTab = 'articles' | 'ratings' | 'favorites';

@Component({
  selector: 'app-profile-activity-tabs',
  imports: [MyArticlesComponent, RatingsComponent, FavoritesComponent],
  templateUrl: './profile-activity-tabs.component.html',
  styleUrl: './profile-activity-tabs.component.css',
})
export class ProfileActivityTabsComponent {
  userId = input.required<string>();
  isMyProfile = input(false);

  activeTab = signal<ActivityTab>('articles');
  reviews = signal<IReview[]>([]);
  favorites = signal<IFavorite[]>([]);
  loadingActivity = signal(false);
  activityError = signal<string | null>(null);

  private requestedTab = signal<ActivityTab | null>(null);
  private profileService = inject(ProfileService);
  private route = inject(ActivatedRoute);

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const tab = params.get('tab');

      if (tab === 'articles' || tab === 'ratings' || tab === 'favorites') {
        this.requestedTab.set(tab);
      }
    });

    effect(() => {
      const userId = this.userId();
      void this.loadActivity(userId);
    });

    effect(() => {
      const tab = this.requestedTab();

      if (tab === 'articles' || tab === 'ratings') {
        this.activeTab.set(tab);
      }

      if (tab === 'favorites' && this.isMyProfile()) {
        this.activeTab.set('favorites');
      }
    });
  }

  setActiveTab(tab: ActivityTab): void {
    if (tab === 'favorites' && !this.isMyProfile()) {
      return;
    }

    this.activeTab.set(tab);
  }

  async reloadActivity(): Promise<void> {
    await this.loadActivity(this.userId());
  }

  private async loadActivity(userId: string): Promise<void> {
    this.loadingActivity.set(true);
    this.activityError.set(null);

    try {
      const activity = await this.profileService.getActivity(userId);
      this.reviews.set(activity.reviews ?? []);
      this.favorites.set(activity.favorites ?? []);
    } catch {
      this.reviews.set([]);
      this.favorites.set([]);
      this.activityError.set('No se pudo cargar la actividad del perfil.');
    } finally {
      this.loadingActivity.set(false);
    }
  }
}