import { Component, input } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
})
export class ButtonComponent {
  class = input<
    | 'btn-primary'
    | 'btn-secondary'
    | 'btn-success'
    | 'btn-danger'
    | 'btn-warning'
    | 'btn-info'
    | 'btn-light'
    | 'btn-dark'
    | 'btn-link'
    | 'btn-outline-primary'
  >('btn-primary');
  showIconLeft = input<boolean>(false);
  iconLeft = input<string>('');
  text = input<string>('');
  showIconRight = input<boolean>(false);
  iconRight = input<string>('');
}