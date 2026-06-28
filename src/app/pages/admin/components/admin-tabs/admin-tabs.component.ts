import { Component, signal } from '@angular/core';
import { ProfilesManagementComponent } from '../profiles-management/profiles-management.component';

type AdminTab = 'profiles' | 'reports' | 'categories' | 'stats';

@Component({
  selector: 'app-admin-tabs',
  imports: [ProfilesManagementComponent],
  templateUrl: './admin-tabs.component.html',
  styleUrl: './admin-tabs.component.css',
})
export class AdminTabsComponent {
  activeTab = signal<AdminTab>('profiles');

  setActiveTab(tab: AdminTab): void {
    this.activeTab.set(tab);
  }
}