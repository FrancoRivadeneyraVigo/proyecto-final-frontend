import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { NavbarComponent } from '../../shared/layout/navbar/navbar.component';

@Component({
  selector: 'app-home',
  imports: [ButtonComponent, AvatarComponent, NavbarComponent ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {

}
