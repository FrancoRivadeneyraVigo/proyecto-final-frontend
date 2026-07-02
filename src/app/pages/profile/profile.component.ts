import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { NavbarComponent } from '../../shared/layout/navbar/navbar.component';
import { FooterComponent } from '../../shared/layout/footer/footer.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { IProfile, IUpdateProfileRequest } from '../../shared/models/profile.interface';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { ProfileActivityTabsComponent } from './components/profile-activity-tabs/profile-activity-tabs.component';
import { ReportUserComponent } from './report-user/report-user.component';

@Component({
  selector: 'app-profile',
  imports: [
    NavbarComponent,
    FooterComponent,
    ButtonComponent,
    ProfileActivityTabsComponent,
    ReportUserComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  routeUserId = signal<string | null>(null);
  user = signal<IProfile | null>(null);
  isEditing = signal(false);
  saving = signal(false);
  selectedPhotoFile = signal<File | null>(null);
  photoPreviewUrl = signal<string | null>(null);
  photoMarkedForDeletion = signal(false);
  isMyProfile = computed(() => {
    const currentUser = this.authService.currentUser();
    const profile = this.user();
    return !!currentUser && !!profile && currentUser.fk_usuarios_id === profile.fk_usuarios_id;
  });
  profileIncompleteMessage = computed(() => {
    const profile = this.user();
    if (!profile) {
      return '';
    }

    const missingFields: string[] = [];
    if (!(profile.name ?? '').trim()) {
      missingFields.push('nombre');
    }
    if (!(profile.surname ?? '').trim()) {
      missingFields.push('apellidos');
    }
    if (!(profile.city ?? '').trim()) {
      missingFields.push('ciudad');
    }

    if (!missingFields.length) {
      return '';
    }

    return `Completa tu perfil añadiendo ${this.formatMissingProfileFields(missingFields)} para empezar a comprar y vender en ATiempo.`;
  });

  private photoObjectUrl: string | null = null;

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
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const userId = params.get('id');
      if (!userId) {
        this.router.navigate(['/404']);
        return;
      }

      this.routeUserId.set(userId);
      void this.loadProfile(userId);
    });
  }

  private async loadProfile(userId: string): Promise<void> {
    this.resetPhotoEditState();
    this.isEditing.set(false);
    this.profileForm.reset();

    if (!this.authService.currentUser()) {
      this.router.navigate(['/login']);
      return;
    }

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
    if (!this.isMyProfile()) {
      return;
    }

    this.resetPhotoEditState();
    this.profileForm.patchValue({
      name: profile.name ?? '',
      surname: profile.surname ?? '',
      username: profile.username,
      phone: profile.phone ?? '',
      country: profile.country,
      city: profile.city ?? '',
      postal_code: profile.postal_code,
      photo_url: profile.photo_url ?? '',
      biography: profile.biography ?? '',
    });
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    this.resetPhotoEditState();
    this.profileForm.reset();
    this.isEditing.set(false);
  }

  async saveProfile(): Promise<void> {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const profile = this.user();
    if (!profile || !this.isMyProfile()) {
      return;
    }

    const formValue = this.profileForm.value;
    const pendingPhoto = this.selectedPhotoFile();
    const markedForDeletion = this.photoMarkedForDeletion();

    this.saving.set(true);
    try {
      let photoUrl = profile.photo_url;

      if (markedForDeletion && !pendingPhoto) {
        await this.profileService.deletePhoto();
        photoUrl = null;
      }

      if (pendingPhoto) {
        const uploadResult = await this.profileService.uploadPhoto(pendingPhoto);
        photoUrl = uploadResult.photo_url;
      }

      const payload: IUpdateProfileRequest = {
        name: formValue.name!,
        surname: formValue.surname!,
        username: formValue.username!,
        phone: formValue.phone?.trim() ? formValue.phone : null,
        country: formValue.country!,
        city: formValue.city!,
        postal_code: formValue.postal_code!,
        photo_url: photoUrl,
        biography: formValue.biography?.trim() ? formValue.biography : null,
      };

      const userId = this.isMyProfile() ? undefined : String(profile.fk_usuarios_id);
      let updated = await this.profileService.updateById(userId, payload);
      updated = { ...updated, photo_url: photoUrl };

      this.user.set(updated);

      if (this.isMyProfile()) {
        this.authService.currentUser.set(updated);
      }

      this.resetPhotoEditState();
      this.isEditing.set(false);
      this.scrollToTop();
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      let message = 'No se pudo actualizar el perfil : ';
       if (error instanceof HttpErrorResponse) {
         message += error.error.message;
       } else {
        message += error;
       }
      toast.error(message);
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
    if (this.photoMarkedForDeletion()) {
      return null;
    }

    const preview = this.photoPreviewUrl();
    if (preview) {
      return preview;
    }

    const url = this.profileForm.get('photo_url')?.value?.trim();
    return url || null;
  }

  markPhotoForDeletion(): void {
    this.clearSelectedPhoto();
    this.photoMarkedForDeletion.set(true);
    this.profileForm.patchValue({ photo_url: '' });
  }

  onDeletePhotoClick(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.markPhotoForDeletion();
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Selecciona un archivo de imagen válido.');
      input.value = '';
      return;
    }

    this.revokePhotoObjectUrl();
    this.photoObjectUrl = URL.createObjectURL(file);
    this.photoMarkedForDeletion.set(false);
    this.selectedPhotoFile.set(file);
    this.photoPreviewUrl.set(this.photoObjectUrl);
    input.value = '';
  }

  triggerPhotoInput(fileInput: HTMLInputElement): void {
    fileInput.click();
  }

  onContact(): void {
    this.router.navigate(['/chats']);
  }

  onReportProfile(): void {
    toast.success('Gracias, hemos recibido tu reporte sobre este perfil.');
  }

  private formatMissingProfileFields(fields: string[]): string {
    const labels = fields.map((field) => (field === 'apellidos' ? 'tus apellidos' : `tu ${field}`));

    if (labels.length === 1) {
      return labels[0];
    }

    if (labels.length === 2) {
      return `${labels[0]} y ${labels[1]}`;
    }

    return `${labels.slice(0, -1).join(', ')} y ${labels[labels.length - 1]}`;
  }

  private clearSelectedPhoto(): void {
    this.revokePhotoObjectUrl();
    this.selectedPhotoFile.set(null);
    this.photoPreviewUrl.set(null);
  }

  private resetPhotoEditState(): void {
    this.clearSelectedPhoto();
    this.photoMarkedForDeletion.set(false);
  }

  private revokePhotoObjectUrl(): void {
    if (this.photoObjectUrl) {
      URL.revokeObjectURL(this.photoObjectUrl);
      this.photoObjectUrl = null;
    }
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async onLogout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
