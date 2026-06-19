import { Component } from '@angular/core';
import { AvatarComponent } from '../../components/avatar/avatar.component';
import { ButtonComponent } from '../../components/button/button.component';

@Component({
  selector: 'app-navbar',
  imports: [ButtonComponent, AvatarComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {}
