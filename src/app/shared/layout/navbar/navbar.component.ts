import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../../components/button/button.component';
import { AvatarComponent } from '../../components/avatar/avatar.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [ButtonComponent, AvatarComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  private authService = inject(AuthService);

  // Signal de solo lectura, expuesto directamente a la plantilla
  currentUser = this.authService.currentUser;
}