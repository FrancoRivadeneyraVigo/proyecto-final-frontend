import { Component, inject, signal } from '@angular/core';
import { NavbarComponent } from '../../shared/layout/navbar/navbar.component';

@Component({
  selector: 'app-home',
  imports: [NavbarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {

  //private articleService = inject(ArticleService)
  searchTerm = signal <string> ('');

  onSearchInput (value: string): void {
    this.searchTerm.set(value)
  }


}