import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { NavbarComponent } from '../../shared/layout/navbar/navbar.component';
import { FooterComponent } from '../../shared/layout/footer/footer.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { IProfile, IUpdateProfileRequest } from '../../shared/models/profile.interface';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { ProfileActivityTabsComponent } from './components/profile-activity-tabs/profile-activity-tabs.component';

@Component({
  selector: 'app-profile',
  imports: [
    NavbarComponent,
    FooterComponent,
    ButtonComponent,
    ProfileActivityTabsComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  id = input<string>();
  user = signal<IProfile | null>(null);
  isEditing = signal(false);
  saving = signal(false);

  profileForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    surname: new FormControl('', [Validators.required]),
    username: new FormControl('', [Validators.required]),
    phone: new FormControl(''),
    country: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    postal_code: new FormControl('', [Validators.required]),
    photo_url: new FormControl(''),
    biography: new FormControl(''),
  });

  profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private router = inject(Router);

  async ngOnInit() {
    const userId: string = String(this.id());
    try {
      this.user.set(await this.profileService.getById(userId));
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        this.router.navigate(['/404']);
        return;
      }
      throw error;
    }
  }

  startEditing(profile: IProfile): void {
    this.profileForm.patchValue({
      name: profile.name,
      surname: profile.surname,
      username: profile.username,
      phone: profile.phone ?? '',
      country: profile.country,
      city: profile.city,
      postal_code: profile.postal_code,
      photo_url: profile.photo_url ?? '',
      biography: profile.biography ?? '',
    });
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    this.profileForm.reset();
    this.isEditing.set(false);
  }

  async saveProfile(): Promise<void> {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const profile = this.user();
    if (!profile) {
      return;
    }

    const formValue = this.profileForm.value;
    const payload: IUpdateProfileRequest = {
      name: formValue.name!,
      surname: formValue.surname!,
      username: formValue.username!,
      phone: formValue.phone?.trim() ? formValue.phone : null,
      country: formValue.country!,
      city: formValue.city!,
      postal_code: formValue.postal_code!,
      photo_url: formValue.photo_url?.trim() ? formValue.photo_url : null,
      biography: formValue.biography?.trim() ? formValue.biography : null,
    };

    this.saving.set(true);
    try {
      const updated = await this.profileService.updateById(String(profile.id), payload);
      this.user.set(updated);

      const currentUser = this.authService.currentUser();
      if (currentUser?.id === profile.id) {
        this.authService.currentUser.set(updated);
      }

      this.isEditing.set(false);
      toast.success('Perfil actualizado correctamente');
    } catch {
      toast.error('No se pudo actualizar el perfil. Inténtalo de nuevo.');
    } finally {
      this.saving.set(false);
    }
  }

  checkError(controlName: string, errorName: string): boolean {
    return this.profileForm.get(controlName)?.hasError(errorName) ?? false;
  }

  checkTouched(controlName: string): boolean {
    return this.profileForm.get(controlName)?.touched ?? false;
  }

  editFormInitials(): string {
    const name = this.profileForm.get('name')?.value ?? '';
    const surname = this.profileForm.get('surname')?.value ?? '';
    const n = name.charAt(0);
    const s = surname.charAt(0);
    if (n && s) {
      return (n + s).toUpperCase();
    }
    return (name || surname).slice(0, 2).toUpperCase() || '?';
  }

  editFormPhotoUrl(): string | null {
    const url = this.profileForm.get('photo_url')?.value?.trim();
    return url || null;
  }

  async onLogout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
