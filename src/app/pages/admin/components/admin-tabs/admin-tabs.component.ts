import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfilesManagementComponent } from '../profiles-management/profiles-management.component';
import { AdminStatsComponent } from '../admin-stats/admin-stats.component';
import { StylesManagementComponent } from '../styles-management/styles-management.component';
import { ReportsManagementComponent } from '../reports-management/reports-management.component';
import { AuthService } from '../../../../services/auth.service';


type AdminTab = 'profiles' | 'reports' | 'styles' | 'stats';

const ADMIN_TABS: AdminTab[] = ['profiles', 'reports', 'styles', 'stats'];

const MODERATOR_TABS: AdminTab[] = ['profiles', 'reports'];

@Component({
  selector: 'app-admin-tabs',
  imports: [ProfilesManagementComponent, AdminStatsComponent, StylesManagementComponent, ReportsManagementComponent],
  templateUrl: './admin-tabs.component.html',
  styleUrl: './admin-tabs.component.css',
})
export class AdminTabsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  role = this.authService.currentUser()?.rol ?? 'user';

  allowedTabs = this.role === 'admin' ? ADMIN_TABS : MODERATOR_TABS; 

  activeTab = signal<AdminTab>(this.role === 'admin' ? 'profiles' : 'reports');

  ngOnInit(): void {
    const tab = this.route.snapshot.queryParamMap.get('tab');

      // <-- añadido: evitar que el moderador abra tabs prohibidas
    if (tab && this.allowedTabs.includes(tab as AdminTab)) {
      this.activeTab.set(tab as AdminTab);
    }

    if (tab && ADMIN_TABS.includes(tab as AdminTab)) {
      this.activeTab.set(tab as AdminTab);
    }
  }

  setActiveTab(tab: AdminTab): void {
    this.activeTab.set(tab);
  }
}
