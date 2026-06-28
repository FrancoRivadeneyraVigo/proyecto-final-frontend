import { Component, inject, signal } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { IProfileDetailUser } from '../../../shared/models/profile.interface';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { NavbarComponent } from '../../../shared/layout/navbar/navbar.component';
import { FooterComponent } from '../../../shared/layout/footer/footer.component';

@Component({
  selector: 'app-profile-detail',
  imports: [RouterLink, CommonModule, AvatarComponent, ButtonComponent, NavbarComponent, FooterComponent],
  templateUrl: './profile-detail.component.html',
  styleUrl: './profile-detail.component.css',
})
export class ProfileDetailComponent {
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);

  profile = signal<IProfileDetailUser | null>(null);
  loading = signal(true);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProfile(id);
  }

  async loadProfile(id: number): Promise<void> {
    this.loading.set(true);
    try {
      const profile = await this.adminService.getProfileDetail(id);
      this.profile.set(profile);
    } catch (error) {
      console.error('Error al cargar el perfil:', error);
      this.profile.set(null);
    } finally {
      this.loading.set(false);
    }
  }
}
