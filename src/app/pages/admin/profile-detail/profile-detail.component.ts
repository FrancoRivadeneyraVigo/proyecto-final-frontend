import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';

// Services
import { AdminService } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';

// Interfaces
import { IProfileDetailUser, IAdminRole, IPurchaseSale, IReport, IFavorite } from '../../../shared/models/profile.interface';

// Shared components
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

// Layout components
import { NavbarComponent } from '../../../shared/layout/navbar/navbar.component';
import { FooterComponent } from '../../../shared/layout/footer/footer.component';

// Feature components
import { ProfileActivityTabsComponent } from '../components/profile-activity-tabs/profile-activity-tabs.component';
import { RolesModalComponent } from '../components/roles-modal/roles-modal.component';

// Utils
import { getHttpErrorMessage } from '../../../shared/utils/http-error-message';

// Types
type AdminProfileTab = 'sales' | 'purchases' | 'favorites' | 'reports';
type ConfirmAction = 'block' | 'unblock' | 'delete' | null;

@Component({
  selector: 'app-profile-detail',
  imports: [
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonComponent,
    NavbarComponent,
    FooterComponent,
    RolesModalComponent,
    ProfileActivityTabsComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './profile-detail.component.html',
  styleUrl: './profile-detail.component.css',
})
export class ProfileDetailComponent {

  // ─── Services ───────────────────────────────────────────────────────────────
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  // ─── Profile state ───────────────────────────────────────────────────────────
  profile = signal<IProfileDetailUser | null>(null);
  roles = signal<IAdminRole[]>([]);
  rolesList = computed(() => this.roles().map(r => r.rol));
  loading = signal(true);

  // ─── Activity tabs state ─────────────────────────────────────────────────────
  activeTab = signal<AdminProfileTab>('sales');
  sales = signal<IPurchaseSale[]>([]);
  purchases = signal<IPurchaseSale[]>([]);
  favorites = signal<IFavorite[]>([]);
  reports = signal<IReport[]>([]);

  // ─── Current user comparison ─────────────────────────────────────────────────
  currentUser = this.authService.currentUser;
  isOwnProfile = computed(() => {
    const current = this.currentUser();
    const viewed = this.profile();
    if (!current || !viewed) return false;
    return current.fk_usuarios_id === viewed.fk_usuarios_id;
  });

  // ─── Confirm modal state ─────────────────────────────────────────────────────
  confirmAction = signal<ConfirmAction>(null);
  processingAction = signal(false);

  // ─── Roles modal state ───────────────────────────────────────────────────────
  showRolesModal = signal(false);
  processingRoles = signal(false);
  rolesForm = new FormGroup({
    admin: new FormControl(false),
    moderator: new FormControl(false),
    user: new FormControl(false),
  });

  // ─── Constructor ─────────────────────────────────────────────────────────────
  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProfile(id);
  }

  // ─── Load profile ────────────────────────────────────────────────────────────
  async loadProfile(id: number): Promise<void> {
    this.loading.set(true);
    try {
      const result = await this.adminService.getProfileDetail(id);
      console.log('Sales:', result.sales);       // ← añadir aquí
      console.log('Purchases:', result.purchases);
      this.profile.set(result.user);
      this.sales.set(result.sales);
      this.purchases.set(result.purchases);
      this.favorites.set(result.favorites);
      this.reports.set(result.reports);

      // Cargamos los roles del usuario por separado
      const rolesResult = await this.adminService.getProfileRoles(result.user.fk_usuarios_id);
      this.roles.set(rolesResult.roles);

    } catch (error) {
      console.error('Error al cargar el perfil:', error);
      toast.error(getHttpErrorMessage(error, 'Error al cargar el perfil'));
      this.profile.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  // ─── Tabs ────────────────────────────────────────────────────────────────────
  setActiveTab(tab: AdminProfileTab): void {
    this.activeTab.set(tab);
  }

  // ─── Confirm modal ───────────────────────────────────────────────────────────
  openConfirm(action: ConfirmAction): void {
    this.confirmAction.set(action);
  }

  closeConfirm(): void {
    if (this.processingAction()) return;
    this.confirmAction.set(null);
  }

  async confirmActionExecute(): Promise<void> {
    const profile = this.profile();
    const action = this.confirmAction();
    if (!profile || !action) return;

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

  // ─── Roles modal ─────────────────────────────────────────────────────────────
  async openRolesModal(): Promise<void> {
    const userId = this.profile()?.fk_usuarios_id;
    if (!userId) return;

    // Obtenemos los roles actuales del usuario
    const res = await this.adminService.getProfileRoles(userId);
    const roleNames = res.roles.map(r => r.rol);

    // Marcamos los checkboxes según los roles actuales
    this.rolesForm.setValue({
      admin: roleNames.includes('admin'),
      moderator: roleNames.includes('moderator'),
      user: roleNames.includes('user'),
    });

    this.showRolesModal.set(true);
  }

  closeRolesModal(): void {
    if (this.processingRoles()) return;
    this.showRolesModal.set(false);
  }

  async saveRoles(): Promise<void> {
    this.processingRoles.set(true);

    try {
      const userId = this.profile()?.fk_usuarios_id;
      if (!userId) return;

      // Roles seleccionados en el formulario
      const selectedRoles = Object.entries(this.rolesForm.value)
        .filter(([_, value]) => value)
        .map(([key]) => key);

      // Debe haber al menos un rol seleccionado
      if (selectedRoles.length === 0) {
        toast.error('El usuario debe tener al menos un rol asignado');
        this.processingRoles.set(false);
        return;
      }

      // Obtenemos los roles actuales
      const current = await this.adminService.getProfileRoles(userId);
      const currentRoles = current.roles.map(r => r.rol);

      // Añadimos los roles nuevos
      for (const rol of selectedRoles) {
        if (!currentRoles.includes(rol)) {
          await this.adminService.addRole(userId, rol);
        }
      }

      // Quitamos los roles desmarcados
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
}
