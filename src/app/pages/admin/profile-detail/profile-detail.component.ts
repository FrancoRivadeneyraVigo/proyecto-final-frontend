import { Component, inject, signal } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { IProfileDetailUser } from '../../../shared/models/profile.interface';
import { IPurchaseSale, IReview, IReport, IFavorite } from '../../../shared/models/profile-activity.interface';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { NavbarComponent } from '../../../shared/layout/navbar/navbar.component';
import { FooterComponent } from '../../../shared/layout/footer/footer.component';
import { ProfileActivityTabsComponent } from '../components/profile-activity-tabs/profile-activity-tabs.component';

type AdminProfileTab = 'sales' | 'purchases' | 'reviews' | 'favorites' | 'reports';

@Component({
  selector: 'app-profile-detail',
  imports: [RouterLink, CommonModule, AvatarComponent, ButtonComponent, NavbarComponent, FooterComponent, ProfileActivityTabsComponent],
  templateUrl: './profile-detail.component.html',
  styleUrl: './profile-detail.component.css',
})
export class ProfileDetailComponent {
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);

  profile = signal<IProfileDetailUser | null>(null);
  loading = signal(true);

  activeTab = signal<AdminProfileTab>('sales');
  sales = signal<IPurchaseSale[]>([]);
  purchases = signal<IPurchaseSale[]>([]);
  reviews = signal<IReview[]>([]);
  favorites = signal<IFavorite[]>([]);
  reports = signal<IReport[]>([]);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProfile(id);
  }

  async loadProfile(id: number): Promise<void> {
    this.loading.set(true);
    try {
      const result = await this.adminService.getProfileDetail(id);
      this.profile.set(result.user);
      this.sales.set(result.sales);
      this.purchases.set(result.purchases);
      this.reviews.set(result.reviews);
      this.favorites.set(result.favorites);
      this.reports.set(result.reports);
    } catch (error) {
      console.error('Error al cargar el perfil:', error);
      this.profile.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  setActiveTab(tab: AdminProfileTab): void {
    this.activeTab.set(tab);
  }
}