import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';

import { ArticleService } from '../../../services/article.service';
import { AuthService } from '../../../services/auth.service';
import { BrandService } from '../../../services/brand.service';
import { ModelService } from '../../../services/model.service';
import { StyleService } from '../../../services/styles.service';

import { IBrand } from '../../models/ibrand.interface';
import { IModel } from '../../models/imodel.interface';
import { IProfile } from '../../models/profile.interface';
import { IStyle } from '../../models/istyle.interface';

import { ICreateArticle, ArticleCondition } from '../../models/icreate-article.component';

import { ButtonComponent } from '../button/button.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { NavbarComponent } from '../../layout/navbar/navbar.component';

const MAX_IMAGES = 5;

@Component({
  selector: 'app-article-form',
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, FooterComponent, NavbarComponent],
  templateUrl: './article-form.component.html',
  styleUrl: './article-form.component.css',
})
export class ArticleFormComponent {

  // Constantes
  readonly maxImages = MAX_IMAGES;

  readonly conditionOptions: { value: string; label: string }[] = [
    { value: 'NEW', label: 'Nuevo' },
    { value: 'VERY_GOOD', label: 'Como nuevo' },
    { value: 'GOOD', label: 'Buen estado' },
    { value: 'USED', label: 'Usado' },
  ];

  // Servicios
  articleService = inject(ArticleService);
  authService = inject(AuthService);
  brandService = inject(BrandService);
  modelService = inject(ModelService);
  styleService = inject(StyleService);

  router = inject(Router);

  // Datos para selects
  brands = signal<IBrand[]>([]);
  models = signal<IModel[]>([]);
  styles = signal<IStyle[]>([]);

  // Imágenes
  selectedImages = signal<File[]>([]);
  imagePreviews = signal<string[]>([]);

  // Formulario
  articleForm = new FormGroup({
    brand: new FormControl<number | null>(
      null,
      Validators.required
    ),
    fk_models_id: new FormControl<number | null>(
      null,
      Validators.required
    ),
    title: new FormControl(
      '',
      [
        Validators.required,
        Validators.maxLength(100),
      ]
    ),
    description: new FormControl(
      '',
      [
        Validators.required,
        Validators.maxLength(1000),
      ]
    ),
    price: new FormControl<number | null>(
      null,
      [
        Validators.required,
        Validators.min(1),
      ]
    ),
    condition: new FormControl(
      'VERY_GOOD',
      Validators.required
    ),
    year_of_manufacture: new FormControl<number | null>(
      new Date().getFullYear(),
      Validators.required
    ),
    movement_type: new FormControl({
        value: '',
        disabled: true,
      }),
    fk_styles_id: new FormControl<number | null>(
      null,
      Validators.required
    ),
    gender: new FormControl({
      value: '',
      disabled: true,
    }),
    case_material: new FormControl(''),
    bracelet_material: new FormControl(''),
    original_box: new FormControl(false),
    original_papers: new FormControl(false),
    shipping_available: new FormControl(true),
  });

  // Constructor
  constructor() {

    const currentUser = this.authService.currentUser();

    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.isProfileCompleteEnoughToSell(currentUser)) {
      void this.goToOwnProfile();
      return;
    }

    void this.loadInitialData();
  }

  // Comprueba que el perfil tenga los datos mínimos para poder vender
  // (mismos campos que ProfileComponent usa para el aviso de perfil incompleto)
  private isProfileCompleteEnoughToSell(profile: IProfile): boolean {
    return !!(profile.name ?? '').trim()
      && !!(profile.surname ?? '').trim()
      && !!(profile.city ?? '').trim();
  }

  // Carga inicial
  async loadInitialData() {

    try {

      const brandsResponse = await this.brandService.getAll();

      this.brands.set(brandsResponse.data);

      const styles = await this.styleService.getAll();

      this.styles.set(styles);

    } catch (error) {

      toast.error(this.getErrorMessage(error, 'Error cargando datos'));

    }

  }

  // Extrae el mensaje real del backend (HttpErrorResponse.error.message)
  // y cae a un mensaje genérico solo si no hay nada útil que mostrar
  private getErrorMessage(error: unknown, fallback: string): string {

    if (error instanceof HttpErrorResponse) {
      return error.error?.message ?? error.message ?? fallback;
    }

    if (error instanceof Error) {
      return error.message || fallback;
    }

    return fallback;

  }

  // Cambio de marca
  async onBrandChange() {

    const brandId = this.articleForm.value.brand;

    if (!brandId) {

      this.models.set([]);

      this.articleForm.patchValue({
        fk_models_id: null,
        movement_type: '',
      });

      return;

    }

    const models = await this.modelService.getByBrandId(brandId);

    this.models.set(models);

    this.articleForm.patchValue({
      fk_models_id: null,
      movement_type: '',
    });

  }

  // Cambio de modelo
  onModelChange() {

    const modelId = this.articleForm.value.fk_models_id;

    const model = this.models().find(
      m => m.id === modelId
    );

    this.articleForm.patchValue({
      movement_type: model?.movement_type ?? '',
      gender: model?.gender ?? '',
    });

  }

  // Estado del reloj (pills)
  selectCondition(value: string) {
    this.articleForm.patchValue({ condition: value });
  }

  // Imágenes
  onImagesSelected(event: Event) {

    const input = event.target as HTMLInputElement;

    if (!input.files?.length) return;

    const incoming = Array.from(input.files);

    const files = [...this.selectedImages(), ...incoming].slice(0, MAX_IMAGES);

    this.selectedImages.set(files);

    const previews = files.map(file =>
      URL.createObjectURL(file)
    );

    this.imagePreviews.set(previews);

    input.value = '';

  }

  removeImage(index: number) {

    const files = [...this.selectedImages()];
    const previews = [...this.imagePreviews()];

    URL.revokeObjectURL(previews[index]);

    files.splice(index, 1);
    previews.splice(index, 1);

    this.selectedImages.set(files);
    this.imagePreviews.set(previews);

  }

  triggerImageInput(input: HTMLInputElement) {
    input.click();
  }

  // Devuelve un array de huecos vacíos para completar la cuadrícula de fotos
  get emptyImageSlots(): number[] {
    const remaining = this.maxImages - this.imagePreviews().length;
    return remaining > 0 ? Array.from({ length: remaining }) : [];
  }

  // Construye el payload que espera el backend, descartando los campos
  // que son solo de uso interno del formulario (brand, movement_type,
  // gender no existen como columnas en articles)
  private buildPayload(publish: boolean): ICreateArticle {

    const raw = this.articleForm.getRawValue();

    return {
      title: raw.title!,
      description: raw.description!,
      price: raw.price!,
      condition: raw.condition as ArticleCondition,
      year_of_manufacture: raw.year_of_manufacture!,
      case_material: raw.case_material || null,
      bracelet_material: raw.bracelet_material || null,
      original_box: raw.original_box!,
      original_papers: raw.original_papers!,
      shipping_available: raw.shipping_available!,
      fk_styles_id: raw.fk_styles_id!,
      fk_models_id: raw.fk_models_id!,
      publish,
    };

  }

  // Navega al perfil del usuario logueado. El :id de la ruta profile/:id
  // debe ser el id real del usuario (fk_usuarios_id), no el literal ":id".
  private goToOwnProfile(): Promise<boolean> {

    const userId = this.authService.currentUser()?.fk_usuarios_id;

    if (!userId) {
      return this.router.navigate(['/login']);
    }

    return this.router.navigate(['/profile', userId]);

  }

  // Submit (publicar artículo)
  async onSubmit() {

    if (this.articleForm.invalid) {

      this.articleForm.markAllAsTouched();

      return;

    }

    try {

      const payload = this.buildPayload(true);

      const article = await this.articleService.createArticleWithImages(
        payload,
        this.selectedImages()
      );

      toast.success('Anuncio publicado');

      await this.goToOwnProfile();

    } catch (error) {

      toast.error(this.getErrorMessage(error, 'Error al publicar el anuncio'));

    }

  }

  // Guardar como borrador
  async saveDraft() {

    if (this.articleForm.invalid) {

      this.articleForm.markAllAsTouched();

      return;

    }

    try {

      const payload = this.buildPayload(false);

      const article = await this.articleService.createArticleWithImages(
        payload,
        this.selectedImages()
      );

      toast.success('Borrador guardado');

      await this.goToOwnProfile();

    } catch (error) {

      toast.error(this.getErrorMessage(error, 'Error al guardar el borrador'));

    }

  }

}