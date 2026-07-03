import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { StyleService } from '../../../../services/styles.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { IStyle } from '../../../../shared/models/istyle.interface';

type StyleModalMode = 'create' | 'edit';
type StylePayload = Omit<IStyle, 'id'>;

@Component({
  selector: 'app-styles-management',
  imports: [ButtonComponent, ConfirmModalComponent, FormsModule],
  templateUrl: './styles-management.component.html',
  styleUrl: './styles-management.component.css',
})
export class StylesManagementComponent {
  private styleService = inject(StyleService);

  styles = signal<IStyle[]>([]);
  loading = signal(false);
  saving = signal(false);
  deleting = signal(false);
  modalMode = signal<StyleModalMode | null>(null);
  selectedStyle = signal<IStyle | null>(null);
  styleToDelete = signal<IStyle | null>(null);
  form = signal<StylePayload>({
    name: '',
    description: null,
  });

  modalTitle = computed(() =>
    this.modalMode() === 'edit' ? 'Editar estilo' : 'Añadir nuevo estilo'
  );

  modalIcon = computed(() =>
    this.modalMode() === 'edit' ? 'bi bi-pencil' : 'bi bi-clipboard-plus'
  );

  constructor() {
    this.loadStyles();
  }

  async loadStyles(): Promise<void> {
    this.loading.set(true);
    try {
      this.styles.set(await this.styleService.getAll());
    } catch (error) {
      console.error('Error al cargar estilos:', error);
      toast.error('No se pudieron cargar los estilos. Inténtalo más tarde.');
      this.styles.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  openCreateModal(): void {
    this.selectedStyle.set(null);
    this.form.set({ name: '', description: null });
    this.modalMode.set('create');
  }

  openEditModal(style: IStyle): void {
    this.selectedStyle.set(style);
    this.form.set({
      name: style.name,
      description: style.description,
    });
    this.modalMode.set('edit');
  }

  closeStyleModal(): void {
    if (!this.saving()) {
      this.modalMode.set(null);
    }
  }

  updateForm(field: keyof StylePayload, value: string): void {
    this.form.update((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async saveStyle(): Promise<void> {
    const payload: StylePayload = {
      name: this.form().name.trim(),
      description: this.form().description?.trim() || null,
    };

    if (!this.validateStyle(payload)) {
      return;
    }

    this.saving.set(true);
    try {
      const selectedStyle = this.selectedStyle();
      if (this.modalMode() === 'edit' && selectedStyle) {
        const updatedStyle = await this.styleService.update(selectedStyle.id, payload);
        this.styles.update((styles) =>
          styles.map((style) => (style.id === selectedStyle.id ? updatedStyle : style))
        );
        toast.success('Estilo actualizado correctamente.');
      } else {
        const createdStyle = await this.styleService.create(payload);
        this.styles.update((styles) => [...styles, createdStyle]);
        toast.success('Estilo creado correctamente.');
      }
      this.modalMode.set(null);
    } catch (error) {
      console.error('Error al guardar estilo:', error);
      toast.error('No se pudo guardar el estilo. Inténtalo más tarde.');
    } finally {
      this.saving.set(false);
    }
  }

  openDeleteModal(style: IStyle): void {
    this.styleToDelete.set(style);
  }

  closeDeleteModal(): void {
    if (!this.deleting()) {
      this.styleToDelete.set(null);
    }
  }

  async deleteStyle(): Promise<void> {
    const style = this.styleToDelete();
    if (!style) {
      return;
    }

    this.deleting.set(true);
    try {
      await this.styleService.delete(style.id);
      this.styles.update((styles) => styles.filter((currentStyle) => currentStyle.id !== style.id));
      this.styleToDelete.set(null);
      toast.success('Estilo eliminado correctamente.');
    } catch (error) {
      console.error('Error al eliminar estilo:', error);
      if (error instanceof HttpErrorResponse && error.status === 409) {
        toast.error('No se puede eliminar el estilo porque está asociado a uno o más artículos.');
      } else {
        toast.error('No se pudo eliminar el estilo. Inténtalo más tarde.');
      }
    } finally {
      this.deleting.set(false);
    }
  }

  private validateStyle(style: StylePayload): boolean {
    if (!style.name) {
      toast.error('El nombre del estilo es obligatorio.');
      return false;
    }

    if (style.name.length > 50) {
      toast.error('El nombre no puede superar los 50 caracteres.');
      return false;
    }

    if ((style.description?.length ?? 0) > 255) {
      toast.error('La descripción no puede superar los 255 caracteres.');
      return false;
    }

    return true;
  }
}
