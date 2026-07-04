import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Collapse } from 'bootstrap';
import { ButtonComponent } from '../../components/button/button.component';
import { AvatarComponent } from '../../components/avatar/avatar.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [ButtonComponent, AvatarComponent, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  @ViewChild('mainNavbar') mainNavbarRef!: ElementRef<HTMLElement>;

  currentUser = this.authService.currentUser;

  async onLogout(): Promise<void> {
    this.closeMenu();
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  private getInstance(): Collapse {
    const el = this.mainNavbarRef.nativeElement;
    return Collapse.getInstance(el) ?? new Collapse(el, { toggle: false });
  }

  toggleMenu(): void {
    this.getInstance().toggle();
  }

  closeMenu(): void {
    this.getInstance().hide();
  }
}