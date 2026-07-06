import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  imports: [],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.css',
})
export class AvatarComponent {
  name = input<string | null>('');
  surname = input<string | null>('');
  photoUrl = input<string | null>(null);

  initials = computed(() => {
    const first = (this.name() ?? '').charAt(0);
    const last = (this.surname() ?? '').charAt(0);
    return (first + last).toUpperCase();
  });
}
