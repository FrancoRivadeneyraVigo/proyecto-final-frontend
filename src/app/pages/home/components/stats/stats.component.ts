import { Component } from '@angular/core';

export interface IStat {
  value: string;
  label: string;
}

@Component({
  selector: 'app-stats',
  imports: [],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.css',
})
export class StatsComponent {
  stats: IStat[] = [
    { value: '50K+', label: 'Relojes disponibles' },
    { value: '15K+', label: 'Vendedores' },
    { value: '98%', label: 'Satisfacción' },
    { value: '24/7', label: 'Soporte' }
  ];
}
