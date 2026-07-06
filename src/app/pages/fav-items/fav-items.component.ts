import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-fav-items',
  imports: [],
  templateUrl: './fav-items.component.html',
  styleUrl: './fav-items.component.css',
})
export class FavItemsComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    const user = this.authService.currentUser();

    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.router.navigate(['/profile', user.fk_usuarios_id], {
      queryParams: { tab: 'favorites' },
    });
  }
}