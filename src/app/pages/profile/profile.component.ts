import { Component, inject, input, OnInit, signal } from '@angular/core';
import { NavbarComponent } from '../../shared/layout/navbar/navbar.component';
import { FooterComponent } from '../../shared/layout/footer/footer.component';
import { IProfile } from '../../shared/models/profile.interface';
import { ProfileService } from '../../shared/services/profile.service';

@Component({
  selector: 'app-profile',
  imports: [NavbarComponent, FooterComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  id = input<string>();
  user = signal<IProfile | null>(null);
  profileService = inject(ProfileService);

  async ngOnInit() {
    const userId: string = String(this.id());
    this.user.set(await this.profileService.getById(userId));
    console.log(this.user());
  }
}
