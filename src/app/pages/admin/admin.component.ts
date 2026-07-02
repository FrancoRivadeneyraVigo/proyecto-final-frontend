import { Component } from '@angular/core';
import { AdminTabsComponent } from '../../pages/admin/components/admin-tabs/admin-tabs.component';
import { NavbarComponent } from '../../shared/layout/navbar/navbar.component';
import { FooterComponent } from '../../shared/layout/footer/footer.component';

@Component({
  selector: 'app-admin',
  imports: [AdminTabsComponent, NavbarComponent, FooterComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent {}