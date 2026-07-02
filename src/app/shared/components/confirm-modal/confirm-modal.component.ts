import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-confirm-modal',
  imports: [ButtonComponent],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.css',
})
export class ConfirmModalComponent {
  title = input.required<string>();
  icon = input<string>('bi bi-shield-exclamation');
  iconColor = input<'success' | 'danger' | 'primary'>('success');
  subtitle = input<string>('');
  subtitleId = input<string | number>('');
  message = input.required<string>();
  confirmText = input<string>('Confirmar');
  confirmIcon = input<string>('bi bi-shield-exclamation');
  cancelText = input<string>('Cancelar');
  processing = input<boolean>(false);

  confirmed = output<void>();
  cancelled = output<void>();

  onConfirm(): void {
    if (!this.processing()) {
      this.confirmed.emit();
    }
  }

  onCancel(): void {
    if (!this.processing()) {
      this.cancelled.emit();
    }
  }
}