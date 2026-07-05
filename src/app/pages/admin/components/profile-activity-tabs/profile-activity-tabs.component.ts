import { Component, computed, input, signal } from '@angular/core';
import { IFavorite, IPurchaseSale, IReport, IReview } from '../../../../shared/models/profile.interface';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { RouterLink } from '@angular/router';

type AdminProfileTab = 'sales' | 'purchases' | 'reviews' | 'favorites' | 'reports';
type ArticleStatusFilter = 'PUBLISHED' | 'DRAFT' | 'UNDER REVIEW' | 'RESERVED' | 'SOLD' | 'RETIRED' | 'all';
type ReportStatusFilter = 'PENDING' | 'UNDER REVIEW' | 'RESOLVED' | 'all';

@Component({
  selector: 'app-profile-activity-tabs',
  imports: [EmptyStateComponent, ButtonComponent, RouterLink],
  templateUrl: './profile-activity-tabs.component.html',
  styleUrl: './profile-activity-tabs.component.css',
})
export class ProfileActivityTabsComponent {
  sales = input.required<IPurchaseSale[]>();
  purchases = input.required<IPurchaseSale[]>();
  reviews = input.required<IReview[]>();
  favorites = input.required<IFavorite[]>();
  reports = input.required<IReport[]>();

  activeTab = signal<AdminProfileTab>('sales');
  statusFilter = signal<ArticleStatusFilter>('PUBLISHED');
  reportStatusFilter = signal<ReportStatusFilter>('PENDING');

  filteredSales = computed(() => this.filterByStatus(this.sales()));
  filteredPurchases = computed(() => this.filterByStatus(this.purchases()));
  filteredReports = computed(() => {
    if (this.reportStatusFilter() === 'all') return this.reports();
    return this.reports().filter((item) => item.status === this.reportStatusFilter());
  });

  setActiveTab(tab: AdminProfileTab): void {
    this.activeTab.set(tab);
    this.statusFilter.set('PUBLISHED');
    this.reportStatusFilter.set('PENDING');
  }

  setStatusFilter(status: ArticleStatusFilter): void {
    this.statusFilter.set(status);
  }

  setReportStatusFilter(status: ReportStatusFilter): void {
    this.reportStatusFilter.set(status);
  }

  private filterByStatus(items: IPurchaseSale[]): IPurchaseSale[] {
    if (this.statusFilter() === 'all') return items;
    return items.filter((item) => item.status === this.statusFilter());
  }
}
