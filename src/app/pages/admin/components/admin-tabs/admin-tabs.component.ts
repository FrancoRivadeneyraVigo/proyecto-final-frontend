import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfilesManagementComponent } from '../profiles-management/profiles-management.component';
import { AdminStatsComponent } from '../admin-stats/admin-stats.component';
import { StylesManagementComponent } from '../styles-management/styles-management.component';


type AdminTab = 'profiles' | 'reports' | 'styles' | 'stats';

const ADMIN_TABS: AdminTab[] = ['profiles', 'reports', 'styles', 'stats'];

@Component({
  selector: 'app-admin-tabs',
  imports: [ProfilesManagementComponent, AdminStatsComponent, StylesManagementComponent],
  templateUrl: './admin-tabs.component.html',
  styleUrl: './admin-tabs.component.css',
})
export class AdminTabsComponent implements OnInit {
  private route = inject(ActivatedRoute);

  activeTab = signal<AdminTab>('profiles');

  ngOnInit(): void {
    const tab = this.route.snapshot.queryParamMap.get('tab');
    if (tab && ADMIN_TABS.includes(tab as AdminTab)) {
      this.activeTab.set(tab as AdminTab);
    }
  }

  setActiveTab(tab: AdminTab): void {
    this.activeTab.set(tab);
  }
}
