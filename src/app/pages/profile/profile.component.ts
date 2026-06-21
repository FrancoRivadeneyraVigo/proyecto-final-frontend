import { Component, inject, input, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../shared/layout/navbar/navbar.component';
import { FooterComponent } from '../../shared/layout/footer/footer.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { IProfile } from '../../shared/models/profile.interface';
import { ProfileService } from '../../shared/services/profile.service';
import { AuthService } from '../../shared/services/auth.service';
import { ProfileActivityTabsComponent } from './components/profile-activity-tabs/profile-activity-tabs.component';

@Component({
  selector: 'app-profile',
  imports: [NavbarComponent, FooterComponent, ButtonComponent, ProfileActivityTabsComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  id = input<string>();
  user = signal<IProfile | null>(null);
  profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private router = inject(Router);

  async ngOnInit() {
    const userId: string = String(this.id());
    try {
      this.user.set(await this.profileService.getById(userId));
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        this.router.navigate(['/404']);
        return;
      }
      throw error;
    }
  }

  async onLogout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
