import { Component, computed, inject, signal } from '@angular/core';
import { AdminService } from '../../../../services/admin.service';
import { IAdminProfile } from '../../../../shared/models/profile.interface';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';

type RoleFilter = 'user' | 'moderator' | 'admin' | 'all';

@Component({
  selector: 'app-profiles-management',
  imports: [ButtonComponent, AvatarComponent, RouterLink, FormsModule],
  templateUrl: './profiles-management.component.html',
  styleUrl: './profiles-management.component.css',
})
export class ProfilesManagementComponent {
  private adminService = inject(AdminService);
  profiles = signal<IAdminProfile[]>([]);
  activeFilter = signal<RoleFilter>('user');
  loading = signal(false);
  searchTerm = signal('');

  // ─── Pagination state ────────────────────────────────────────────────────────
  currentPage = signal(1);
  pageSize = 10;

  filteredProfiles = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.profiles();
    }
    return this.profiles().filter((profile) => {
      const fullName = `${profile.name ?? ''} ${profile.surname ?? ''}`.toLowerCase();
      const username = (profile.username ?? '').toLowerCase();
      const id = String(profile.fk_usuarios_id);
      return (
        fullName.includes(term) ||
        username.includes(term) ||
        id.includes(term)
      );
    });
  });

  totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.filteredProfiles().length / this.pageSize));
  });

  paginatedProfiles = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredProfiles().slice(start, start + this.pageSize);
  });

  pagesArray = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  });
  
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
      this.currentPage.set(1);
    } catch (error) {
      console.error('Error al cargar perfiles:', error);
      toast.error('No se pudieron cargar los perfiles. Inténtalo más tarde.');
      this.profiles.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }
}