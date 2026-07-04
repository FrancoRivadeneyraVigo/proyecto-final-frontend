import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
import {
  ArticleCondition,
  IArticleDetail,
  IArticleImage,
  ICreateArticle,
  IUpdateArticle,
} from '../../models/article.interface';

import { getHttpErrorMessage } from '../../utils/http-error-message';

import { ButtonComponent } from '../button/button.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { NavbarComponent } from '../../layout/navbar/navbar.component';

const MAX_IMAGES = 5;

// Una "foto" en el grid puede ser una imagen ya guardada en el
// servidor (con id, para poder borrarla con DELETE /images) o una
// imagen nueva todavía sin subir (un File local con su preview)
interface IPhotoSlot {
  preview: string;
  existingImage?: IArticleImage;
  newFile?: File;
}

@Component({
  selector: 'app-article-form',
  imports: [ReactiveFormsModule, ButtonComponent, FooterComponent, NavbarComponent],
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

  private route = inject(ActivatedRoute);
  router = inject(Router);

  // Modo edición: si la ruta tiene :id (articles/:id/edit) editamos
  // ese artículo; si no, creamos uno nuevo (articles/sell)
  private readonly articleId: number | null = this.resolveArticleId();
  readonly isEditMode = this.articleId !== null;

  isLoading = signal(this.isEditMode);

  // Si estamos editando un artículo que está en borrador, mostramos
  // además el botón de publicarlo (el backend no permite cambiar el
  // status a través de PUT /articles/:id, solo con PATCH /publish)
  isDraft = signal(false);

  // Datos para selects
  brands = signal<IBrand[]>([]);
  models = signal<IModel[]>([]);
  styles = signal<IStyle[]>([]);

  // Fotos: tanto las ya guardadas (en modo edición) como las nuevas
  // que el usuario va seleccionando viven juntas en este único grid
  photoSlots = signal<IPhotoSlot[]>([]);

  // Imágenes existentes cuyo botón de borrar se ha pulsado: se borran
  // del servidor solo al guardar, no al pulsar la "x"
  private removedImageIds = signal<number[]>([]);

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

    if (!this.isEditMode && !this.isProfileCompleteEnoughToSell(currentUser)) {
      void this.goToOwnProfile();
      return;
    }

    void this.loadInitialData();

  }

  isFieldInvalid(field: string): boolean {

    const control = this.articleForm.get(field);

    return !!control && control.invalid && control.touched;

  }

  getFieldError(field: string): string {

    const control = this.articleForm.get(field);

    if (!control || !control.errors) {
      return '';
    }

    switch (field) {

      case 'title':

        if (control.errors['required']) {
          return 'El título es obligatorio.';
        }

        if (control.errors['maxlength']) {
          return 'El título no puede superar los 100 caracteres.';
        }

        break;

      case 'description':

        if (control.errors['required']) {
          return 'La descripción es obligatoria.';
        }

        if (control.errors['maxlength']) {
          return 'La descripción no puede superar los 1000 caracteres.';
        }

        break;

      case 'brand':

        if (control.errors['required']) {
          return 'Debes seleccionar una marca.';
        }

        break;

      case 'fk_models_id':

        if (control.errors['required']) {
          return 'Debes seleccionar un modelo.';
        }

        break;

      case 'fk_styles_id':

        if (control.errors['required']) {
          return 'Debes seleccionar un estilo.';
        }

        break;

      case 'price':

        if (control.errors['required']) {
          return 'El precio es obligatorio.';
        }

        if (control.errors['min']) {
          return 'El precio debe ser superior a 0 €.';
        }

        break;

      case 'year_of_manufacture':

        if (control.errors['required']) {
          return 'El año de fabricación es obligatorio.';
        }

        break;

    }

    return 'Valor no válido.';

  }

  // Lee el :id de la ruta articles/:id/edit. Si no existe (estamos en
  // articles/sell), devuelve null y el formulario actúa en modo creación
  private resolveArticleId(): number | null {

    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam) {
      return null;
    }

    const id = Number(idParam);

    return Number.isFinite(id) ? id : null;

  }

  // Comprueba que el perfil tenga los datos mínimos para poder vender
  // (mismos campos que ProfileComponent usa para el aviso de perfil incompleto)
  private isProfileCompleteEnoughToSell(profile: IProfile): boolean {
    return !!(profile.name ?? '').trim()
      && !!(profile.surname ?? '').trim()
      && !!(profile.city ?? '').trim();
  }

  // Carga inicial: marcas y estilos siempre, y si estamos editando,
  // además el artículo a editar (que arrastra ya su modelo, marca y estilo)
  async loadInitialData() {

    try {

      const brandsResponse = await this.brandService.getAll();

      this.brands.set(brandsResponse.data);

      const styles = await this.styleService.getAll();

      this.styles.set(styles);

      if (this.isEditMode && this.articleId !== null) {
        await this.loadArticleToEdit(this.articleId);
      }

    } catch (error) {

      toast.error(getHttpErrorMessage(error, 'Error cargando datos'));

    } finally {

      this.isLoading.set(false);

    }

  }

  // Carga el artículo a editar y rellena el formulario con sus datos.
  // La protección real de "solo el owner puede editar" la hace el
  // backend (devuelve 403 al guardar); aquí solo evitamos que alguien
  // que no es el dueño llegue a ver el formulario rellenado
  private async loadArticleToEdit(articleId: number): Promise<void> {

    const article = await this.articleService.getArticleById(articleId);

    const currentUserId = this.authService.currentUser()?.fk_usuarios_id;

    if (currentUserId !== article.fk_users_id) {
      toast.error('No tienes permiso para editar este artículo');
      await this.goToOwnProfile();
      return;
    }

    await this.populateFormFromArticle(article);

  }

  // Vuelca los datos del artículo en el formulario, carga los modelos
  // de su marca para que el select de modelo tenga opciones, y muestra
  // sus imágenes existentes en el grid de fotos
  private async populateFormFromArticle(article: IArticleDetail): Promise<void> {

    this.isDraft.set(article.status === 'DRAFT');

    const brandId = article.brand?.id ?? null;
    const modelId = article.model?.id ?? null;

    if (brandId) {
      const models = await this.modelService.getByBrandId(brandId);
      this.models.set(models);
    }

    const model = this.models().find(m => m.id === modelId);

    this.articleForm.patchValue({
      brand: brandId,
      fk_models_id: modelId,
      title: article.title,
      description: article.description ?? '',
      price: Number(article.price),
      condition: article.condition ?? 'VERY_GOOD',
      year_of_manufacture: article.year_of_manufacture ?? new Date().getFullYear(),
      movement_type: model?.movement_type ?? article.movement_type ?? '',
      fk_styles_id: article.style?.id ?? null,
      gender: model?.gender ?? '',
      case_material: article.case_material ?? '',
      bracelet_material: article.bracelet_material ?? '',
      original_box: !!article.original_box,
      original_papers: !!article.original_papers,
      shipping_available: !!article.shipping_available,
    });

    const existingSlots: IPhotoSlot[] = (article.images ?? []).map(image => ({
      preview: image.image_url,
      existingImage: image,
    }));

    this.photoSlots.set(existingSlots);

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

  // Imágenes: añade las nuevas fotos seleccionadas al mismo grid en
  // el que ya están las existentes, respetando el máximo total
  onImagesSelected(event: Event) {

    const input = event.target as HTMLInputElement;

    if (!input.files?.length) return;

    const incoming = Array.from(input.files).map<IPhotoSlot>(file => ({
      preview: URL.createObjectURL(file),
      newFile: file,
    }));

    const slots = [...this.photoSlots(), ...incoming].slice(0, MAX_IMAGES);

    this.photoSlots.set(slots);

    input.value = '';

  }

  // Quita una foto del grid. Si era una imagen ya guardada en el
  // servidor, anota su id para borrarla al guardar; si era una foto
  // nueva todavía sin subir, simplemente se descarta
  removeImage(index: number) {

    const slots = [...this.photoSlots()];
    const [removed] = slots.splice(index, 1);

    if (!removed) {
      return;
    }

    if (removed.existingImage) {
      this.removedImageIds.set([...this.removedImageIds(), removed.existingImage.id]);
    } else {
      URL.revokeObjectURL(removed.preview);
    }

    this.photoSlots.set(slots);

  }

  triggerImageInput(input: HTMLInputElement) {
    input.click();
  }

  // Previews a mostrar en el grid (existentes + nuevas, en el orden
  // en que están en photoSlots; la primera sigue siendo la principal)
  get imagePreviews(): string[] {
    return this.photoSlots().map(slot => slot.preview);
  }

  // Devuelve un array de huecos vacíos para completar la cuadrícula de fotos
  get emptyImageSlots(): number[] {
    const remaining = this.maxImages - this.photoSlots().length;
    return remaining > 0 ? Array.from({ length: remaining }) : [];
  }

  // Construye el payload que espera el backend, descartando los campos
  // que son solo de uso interno del formulario (brand, movement_type,
  // gender no existen como columnas en articles)
  private buildPayload(): IUpdateArticle {

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
    };

  }

  // Las fotos nuevas (todavía sin subir) del grid actual
  private get newImageFiles(): File[] {
    return this.photoSlots()
      .map(slot => slot.newFile)
      .filter((file): file is File => !!file);
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

  // Submit: publica un artículo nuevo o guarda los cambios de uno
  // existente, según el modo en el que esté el formulario
  async onSubmit() {

    if (this.articleForm.invalid) {

      this.articleForm.markAllAsTouched();

      toast.error('Completa todos los campos obligatorios antes de continuar.');

      return;

    }

    try {

      if (this.isEditMode && this.articleId !== null) {

        await this.articleService.updateArticleWithImages(
          this.articleId,
          this.buildPayload(),
          this.newImageFiles,
          this.removedImageIds()
        );

        toast.success('Artículo actualizado');

      } else {

        const payload: ICreateArticle = { ...this.buildPayload(), publish: true };

        await this.articleService.createArticleWithImages(
          payload,
          this.newImageFiles
        );

        toast.success('Anuncio publicado');

      }

      await this.goToOwnProfile();

    } catch (error) {

      const fallback = this.isEditMode
        ? 'Error al actualizar el artículo'
        : 'Error al publicar el anuncio';

      toast.error(getHttpErrorMessage(error, fallback));

    }

  }

  // Guardar como borrador (solo disponible al crear un artículo nuevo)
  async saveDraft() {

    if (this.articleForm.invalid) {

      this.articleForm.markAllAsTouched();

      toast.error('Completa todos los campos obligatorios antes de guardar el borrador.');

      return;

    }

    try {

      const payload: ICreateArticle = { ...this.buildPayload(), publish: false };

      await this.articleService.createArticleWithImages(
        payload,
        this.newImageFiles
      );

      toast.success('Borrador guardado');

      await this.goToOwnProfile();

    } catch (error) {

      toast.error(getHttpErrorMessage(error, 'Error al guardar el borrador'));

    }

  }

  // Publicar un borrador existente (solo disponible al editar un
  // artículo que está en DRAFT). Primero guarda los cambios pendientes
  // del formulario (datos e imágenes) y, si eso sale bien, lo publica
  async publishFromEdit() {

    if (this.articleForm.invalid) {

      this.articleForm.markAllAsTouched();

      toast.error('Completa todos los campos obligatorios antes de guardar el borrador.');

      return;

    }

    if (this.articleId === null) {
      return;
    }

    try {

      await this.articleService.updateArticleWithImages(
        this.articleId,
        this.buildPayload(),
        this.newImageFiles,
        this.removedImageIds()
      );

      await this.articleService.publishArticle(this.articleId);

      toast.success('Artículo publicado');

      await this.goToOwnProfile();

    } catch (error) {

      toast.error(getHttpErrorMessage(error, 'Error al publicar el artículo'));

    }

  }

}