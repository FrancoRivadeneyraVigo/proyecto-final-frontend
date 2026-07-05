import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-roles-modal',
  imports: [ButtonComponent, ReactiveFormsModule],
  templateUrl: './roles-modal.component.html',
  styleUrl: './roles-modal.component.css',
})
export class RolesModalComponent {
  userName = input<string>('');
  userId = input<number | null>(null);
  
  // Recibe el FormGroup ya construido desde ProfileDetailComponent
  rolesForm = input.required<FormGroup>();
  // true mientras se están guardando los roles (deshabilita botones)
  processing = input<boolean>(false);
  // Emite cuando el usuario pulsa "Guardar"
  confirmed = output<void>();
  // Emite cuando el usuario pulsa "Cancelar" o el backdrop
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