import { Component, signal } from '@angular/core';
import { ProfilesManagementComponent } from '../profiles-management/profiles-management.component';
import { AdminStatsComponent } from '../admin-stats/admin-stats.component';
import { StylesManagementComponent } from '../styles-management/styles-management.component';


type AdminTab = 'profiles' | 'reports' | 'styles' | 'stats';

@Component({
  selector: 'app-admin-tabs',
  imports: [ProfilesManagementComponent, AdminStatsComponent, StylesManagementComponent],
  templateUrl: './admin-tabs.component.html',
  styleUrl: './admin-tabs.component.css',
})
export class AdminTabsComponent {
  activeTab = signal<AdminTab>('profiles');

  setActiveTab(tab: AdminTab): void {
    this.activeTab.set(tab);
  }
}
