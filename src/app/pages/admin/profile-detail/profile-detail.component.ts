import { Component, computed, inject, signal } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { IProfileDetailUser } from '../../../shared/models/profile.interface';
import { IPurchaseSale, IReview, IReport, IFavorite } from '../../../shared/models/profile-activity.interface';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toast } from 'ngx-sonner';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { NavbarComponent } from '../../../shared/layout/navbar/navbar.component';
import { FooterComponent } from '../../../shared/layout/footer/footer.component';
import { ProfileActivityTabsComponent } from '../components/profile-activity-tabs/profile-activity-tabs.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { getHttpErrorMessage } from '../../../shared/utils/http-error-message';
import { FormControl, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';

type AdminProfileTab = 'sales' | 'purchases' | 'reviews' | 'favorites' | 'reports';
type ConfirmAction = 'block' | 'unblock' | 'delete' | null;

@Component({
  selector: 'app-profile-detail',
  imports: [RouterLink, 
            CommonModule, 
            AvatarComponent, 
            ButtonComponent, 
            NavbarComponent, 
            FooterComponent, 
            ProfileActivityTabsComponent, 
            ConfirmModalComponent,
            ReactiveFormsModule,
            FormsModule
          ],
  templateUrl: './profile-detail.component.html',
  styleUrl: './profile-detail.component.css',
})
export class ProfileDetailComponent {
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);
  profile = signal<IProfileDetailUser | null>(null);
  rolesList = computed(() => {
    const raw = this.profile()?.rol || '';
    return raw
      .split(',')
      .map(r => r.trim())
      .filter(r => r.length > 0);
  });
  loading = signal(true);
  activeTab = signal<AdminProfileTab>('sales');
  sales = signal<IPurchaseSale[]>([]);
  purchases = signal<IPurchaseSale[]>([]);
  reviews = signal<IReview[]>([]);
  favorites = signal<IFavorite[]>([]);
  reports = signal<IReport[]>([]);

  // Estado del modal de confirmación
  confirmAction = signal<ConfirmAction>(null);
  processingAction = signal(false);

  // Modal roles
showRolesModal = signal(false);
processingRoles = signal(false);

rolesForm = new FormGroup({
  admin: new FormControl(false),
  moderator: new FormControl(false),
  user: new FormControl(false),
});

async openRolesModal() {
  const userId = this.profile()?.fk_usuarios_id;
  if (!userId) return;

  // Obtener roles reales desde el backend
  const res = await this.adminService.getProfileRoles(userId);
  const roles = res.roles.map(r => r.rol);

  // Marcar los checkboxes según los roles reales
  this.rolesForm.setValue({
    admin: roles.includes('admin'),
    moderator: roles.includes('moderator'),
    user: roles.includes('user'),
  });
  
  this.showRolesModal.set(true);
}

closeRolesModal() {
  if (this.processingRoles()) return;
  this.showRolesModal.set(false);
}

async saveRoles() {
  this.processingRoles.set(true);

  try {
    const userId = this.profile()?.fk_usuarios_id;
    if (!userId) return;

    // 1. Roles actuales desde backend
    const current = await this.adminService.getProfileRoles(userId);
    const currentRoles = current.roles.map(r => r.rol);

    // 2. Roles seleccionados en el formulario (CORREGIDO)
    const selectedRoles = Object.entries(this.rolesForm.value)
      .filter(([_, value]) => value)
      .map(([key]) => key);

    // 3. Añadir roles nuevos
    for (const rol of selectedRoles) {
      if (!currentRoles.includes(rol)) {
        await this.adminService.addRole(userId, rol);
      }
    }

    // 4. Quitar roles desmarcados
    for (const role of current.roles) {
      if (!selectedRoles.includes(role.rol)) {
        await this.adminService.removeRole(userId, role.roleId);
      }
    }

    toast.success('Roles actualizados correctamente');
    await this.loadProfile(userId);

  } catch (error) {
    toast.error('No se pudieron actualizar los roles');
  } finally {
    this.processingRoles.set(false);
    this.showRolesModal.set(false);
  }
}

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProfile(id);
  }

  async loadProfile(id: number): Promise<void> {
    this.loading.set(true);
    try {
      const result = await this.adminService.getProfileDetail(id);
      this.profile.set(result.user);
      this.sales.set(result.sales);
      this.purchases.set(result.purchases);
      this.reviews.set(result.reviews);
      this.favorites.set(result.favorites);
      this.reports.set(result.reports);
    } catch (error) {
      console.error('Error al cargar el perfil:', error);
      toast.error(getHttpErrorMessage(error, 'Error al cargar el perfil'));
      this.profile.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  setActiveTab(tab: AdminProfileTab): void {
    this.activeTab.set(tab);
  }

  // Abre el modal con la acción correspondiente
  openConfirm(action: ConfirmAction): void {
    this.confirmAction.set(action);
  }

  closeConfirm(): void {
    if (this.processingAction()) {
      return;
    }
    this.confirmAction.set(null);
  }

  async confirmActionExecute(): Promise<void> {
    const profile = this.profile();
    const action = this.confirmAction();
    if (!profile || !action) {
      return;
    }

    const userId = profile.fk_usuarios_id;

    this.processingAction.set(true);
    try {
      switch (action) {
        case 'block':
          await this.adminService.blockProfile(userId);
          toast.success('Perfil bloqueado correctamente');
          break;
        case 'unblock':
          await this.adminService.unblockProfile(userId);
          toast.success('Perfil desbloqueado correctamente');
          break;
        case 'delete':
          await this.adminService.deleteProfile(userId);
          toast.success('Perfil dado de baja correctamente');
          break;
      }
      await this.loadProfile(userId);
      this.confirmAction.set(null);
    } catch (error) {
      console.error(`Error al ejecutar la acción "${action}":`, error);
      toast.error('No se pudo completar la acción. Inténtalo de nuevo.');
    } finally {
      this.processingAction.set(false);
    }
  }
}