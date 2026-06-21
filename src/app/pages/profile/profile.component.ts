import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../shared/layout/navbar/navbar.component';
import { FooterComponent } from '../../shared/layout/footer/footer.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { IProfile } from '../../shared/models/profile.interface';
import { ProfileService } from '../../shared/services/profile.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-profile',
  imports: [NavbarComponent, FooterComponent, ButtonComponent],
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
    this.user.set(await this.profileService.getById(userId));
  }

  async onLogout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
