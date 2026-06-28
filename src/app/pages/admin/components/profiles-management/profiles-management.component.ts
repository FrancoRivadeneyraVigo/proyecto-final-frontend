import { Component, inject, signal } from '@angular/core';
import { AdminService } from '../../../../services/admin.service';
import { IAdminProfile } from '../../../../shared/models/profile.interface';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';
import { RouterLink } from '@angular/router';

type RoleFilter = 'user' | 'moderator' | 'admin' | 'all';

@Component({
  selector: 'app-profiles-management',
  imports: [ButtonComponent, AvatarComponent, RouterLink],
  templateUrl: './profiles-management.component.html',
  styleUrl: './profiles-management.component.css',
})
export class ProfilesManagementComponent {
  private adminService = inject(AdminService);
  profiles = signal<IAdminProfile[]>([]);
  activeFilter = signal<RoleFilter>('user');
  loading = signal(false);

  constructor() {
    this.loadProfiles('user');
  }

  async loadProfiles(filter: RoleFilter): Promise<void> {
    this.activeFilter.set(filter);
    this.loading.set(true);
    try {
      const result =
        filter === 'all'
          ? await this.adminService.getAllProfilesWithRole()
          : await this.adminService.getProfilesByRole(filter);
      this.profiles.set(result);
    } catch (error) {
      console.error('Error al cargar perfiles:', error);
      this.profiles.set([]);
    } finally {
      this.loading.set(false);
    }
  }
}