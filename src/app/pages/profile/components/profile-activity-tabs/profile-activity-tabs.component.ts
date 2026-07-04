import { Component, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { FavoritesComponent } from '../favorites/favorites.component';
import { MyArticlesComponent } from '../my-articles/my-articles.component';
import { ProfileService } from '../../../../services/profile.service';
import { IFavorite } from '../../../../shared/models/profile.interface';

type ActivityTab = 'articles' | 'favorites';

@Component({
  selector: 'app-profile-activity-tabs',
  imports: [MyArticlesComponent, FavoritesComponent],
  templateUrl: './profile-activity-tabs.component.html',
  styleUrl: './profile-activity-tabs.component.css',
})
export class ProfileActivityTabsComponent {
  userId = input.required<string>();
  isMyProfile = input(false);

  activeTab = signal<ActivityTab>('articles');
  favorites = signal<IFavorite[]>([]);
  loadingActivity = signal(false);
  activityError = signal<string | null>(null);

  private requestedTab = signal<ActivityTab | null>(null);
  private profileService = inject(ProfileService);
  private route = inject(ActivatedRoute);

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const tab = params.get('tab');

      if (tab === 'articles' || tab === 'favorites') {
        this.requestedTab.set(tab);
      }
    });

    effect(() => {
      const userId = this.userId();
      void this.loadActivity(userId);
    });

    effect(() => {
      const tab = this.requestedTab();

      if (tab === 'articles') {
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
      this.favorites.set(activity.favorites ?? []);
    } catch {
      this.favorites.set([]);
      this.activityError.set('No se pudo cargar la actividad del perfil.');
    } finally {
      this.loadingActivity.set(false);
    }
  }
}