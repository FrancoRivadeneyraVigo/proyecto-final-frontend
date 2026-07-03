import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';


import { NavbarComponent } from '../../shared/layout/navbar/navbar.component';
import { FooterComponent } from '../../shared/layout/footer/footer.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

import { ArticleService } from '../../services/article.service';
import { BrandService } from '../../services/brand.service';
import { ModelService } from '../../services/model.service';
import { StyleService } from '../../services/styles.service';

import { IArticleSummary } from '../../shared/models/article-detail.interface';
import { IBrand } from '../../shared/models/ibrand.interface';
import { IModel } from '../../shared/models/imodel.interface';
import { IStyle } from '../../shared/models/istyle.interface';
import { ActivatedRoute } from '@angular/router';

const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 50000;

const MOVEMENT_TYPES = ['AUTOMATIC', 'MANUAL', 'QUARTZ', 'KINETIC'];
const CONDITIONS = ['NEW', 'VERY_GOOD', 'GOOD', 'USED'];
const GENDERS = ['MENS', 'WOMENS', 'UNISEX'];

// DICCIONARIOS DE TRADUCCIÓN PARA LA VISTA
const MOVEMENT_TRANSLATIONS: Record<string, string> = {
  'AUTOMATIC': 'Automático',
  'MANUAL': 'Manual',
  'QUARTZ': 'Cuarzo',
  'KINETIC': 'Kinetic'
};

const CONDITION_TRANSLATIONS: Record<string, string> = {
  'NEW': 'Nuevo',
  'VERY_GOOD': 'Muy bueno',
  'GOOD': 'Bueno',
  'USED': 'Usado'
};

const GENDER_TRANSLATIONS: Record<string, string> = {
  'MENS': 'Masculino',
  'WOMENS': 'Femenino',
  'UNISEX': 'Unisex'
};

@Component({
  selector: 'app-explore',
  imports: [
    CommonModule,
    FormsModule,
    NavbarComponent,
    FooterComponent,
    ProductCardComponent,
  ],
  templateUrl: './explore.component.html',
  styleUrl: './explore.component.css'
})
export class ExploreComponent implements OnInit {

  // Hacemos accesibles las traducciones en el HTML
  readonly movementTranslations = MOVEMENT_TRANSLATIONS;
  readonly conditionTranslations = CONDITION_TRANSLATIONS;
  readonly genderTranslations = GENDER_TRANSLATIONS;

  private articleService = inject(ArticleService);
  private brandService = inject(BrandService);
  private modelService = inject(ModelService);
  private styleService = inject(StyleService);

  private route = inject(ActivatedRoute);

  // Listas fijas para los selects/checkboxes que no vienen de la API
  readonly movementTypes = MOVEMENT_TYPES;
  readonly conditions = CONDITIONS;
  readonly genders = GENDERS;

  readonly currentYear = new Date().getFullYear();
  readonly priceMin = DEFAULT_MIN_PRICE;
  readonly priceMax = DEFAULT_MAX_PRICE;

  readonly loading = signal(false);

  readonly showMobileFilters = signal(false);

  readonly filteredArticles = signal<IArticleSummary[]>([]);

  readonly brands = signal<IBrand[]>([]);
  readonly models = signal<IModel[]>([]);
  readonly styles = signal<IStyle[]>([]);

  search = '';

  selectedBrand?: number;

  // Ahora admite selección múltiple de modelos
  selectedModels: number[] = [];

  selectedStyle?: number;

  selectedGenders: string[] = [];
  selectedMovements: string[] = [];
  selectedConditions: string[] = [];

  year?: number;

  minPrice = DEFAULT_MIN_PRICE;
  maxPrice = DEFAULT_MAX_PRICE;

  originalBox = false;
  originalPapers = false;
  shipping = false;

  readonly currentPage = signal(1);
  readonly pageSize = 9;

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredArticles().length / this.pageSize))
  );

  readonly pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  readonly paginatedArticles = computed(() => {

    const start = (this.currentPage() - 1) * this.pageSize;

    return this.filteredArticles().slice(
      start,
      start + this.pageSize
    );

  });

  async ngOnInit() {
    this.loading.set(true);

    const searchParam = this.route.snapshot.queryParamMap.get('search')
    if (searchParam) {
      this.search = searchParam;
    }

    try {
      await Promise.all([
        this.loadBrands().catch(err => console.error('Error cargando marcas:', err)),
        this.loadStyles().catch(err => console.error('Error cargando estilos (público):', err))
      ]);

      if (searchParam) {
        await this.applyFilters();
      } else {
        await this.loadArticles();
      }

    } catch (error) {
      console.error('Error general en la inicialización:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async loadArticles() {

    const response = await this.articleService.getAll(500);

    this.filteredArticles.set(response.data as unknown as IArticleSummary[]);

  }

  async loadBrands() {

    const response = await this.brandService.getAll();

    this.brands.set(response.data);

  }

  async loadStyles() {

    this.styles.set(await this.styleService.getAll());

  }

  // Marca -> Modelo (dinámico, sin recargar la página)
  async selectBrand(brandId: number) {

    // Si se vuelve a pulsar la misma marca, se deselecciona
    this.selectedBrand = this.selectedBrand === brandId ? undefined : brandId;

    await this.onBrandChange();

  }

  async onBrandChange() {

    this.selectedModels = [];

    if (!this.selectedBrand) {

      this.models.set([]);

      await this.applyFilters();

      return;

    }

    this.models.set(
      await this.modelService.getByBrandId(this.selectedBrand)
    );

    await this.applyFilters();

  }

  // Selección múltiple de modelos
  toggleModel(modelId: number) {

    this.selectedModels = this.selectedModels.includes(modelId)
      ? this.selectedModels.filter(id => id !== modelId)
      : [...this.selectedModels, modelId];

    this.applyFilters();

  }

  isModelSelected(modelId: number): boolean {
    return this.selectedModels.includes(modelId);
  }

  // Resto de filtros de selección múltiple, emulados con checkboxes
  selectStyle(styleId: number) {
    this.selectedStyle = this.selectedStyle === styleId ? undefined : styleId;
    this.applyFilters();
  }

  toggleGender(gender: string) {
    this.selectedGenders = this.selectedGenders.includes(gender)
      ? this.selectedGenders.filter(g => g !== gender)
      : [...this.selectedGenders, gender];
    this.applyFilters();
  }

  isGenderSelected(gender: string): boolean {
    return this.selectedGenders.includes(gender);
  }

  toggleMovement(movement: string) {
    this.selectedMovements = this.selectedMovements.includes(movement)
      ? this.selectedMovements.filter(m => m !== movement)
      : [...this.selectedMovements, movement];
    this.applyFilters();
  }

  isMovementSelected(movement: string): boolean {
    return this.selectedMovements.includes(movement);
  }

  toggleCondition(condition: string) {
    this.selectedConditions = this.selectedConditions.includes(condition)
      ? this.selectedConditions.filter(c => c !== condition)
      : [...this.selectedConditions, condition];
    this.applyFilters();
  }

  isConditionSelected(condition: string): boolean {
    return this.selectedConditions.includes(condition);
  }

  // Precio (slider doble)
  onPriceChange() {

    // Evita que el mínimo supere al máximo y viceversa
    if (this.minPrice > this.maxPrice) {
      this.maxPrice = this.minPrice;
    }

    this.applyFilters();

  }

  minPricePercent(): number {
    return (this.minPrice / this.priceMax) * 100;
  }

  maxPricePercent(): number {
    return (this.maxPrice / this.priceMax) * 100;
  }

  formatPrice(value: number): string {
    return value.toLocaleString('es-ES');
  }

  // Filtrado
  async applyFilters() {

    this.loading.set(true);

    try {

      if (this.search.trim()) {

        const result = await this.articleService.searchArticles(this.search);

        this.filteredArticles.set(result as unknown as IArticleSummary[]);

      } else {

        const filters = {
          minPrice: this.minPrice,
          maxPrice: this.maxPrice,

          brandId: this.selectedBrand,
          modelIds: this.selectedModels.length ? this.selectedModels.join(',') : undefined,
          styleId: this.selectedStyle,

          gender: this.selectedGenders.length ? this.selectedGenders.join(',') : undefined,
          movementType: this.selectedMovements.length ? this.selectedMovements.join(',') : undefined,
          condition: this.selectedConditions.length ? this.selectedConditions.join(',') : undefined,

          yearOfManufacture: this.year,

          originalBox: this.originalBox ? true : undefined,
          originalPapers: this.originalPapers ? true : undefined,
          shippingAvailable: this.shipping ? true : undefined
        };

        const result = await this.articleService.filterArticles(filters);

        this.filteredArticles.set(result);

      }

      this.currentPage.set(1);

    } finally {

      this.loading.set(false);

    }

  }

  async resetFilters() {
    this.search = '';

    this.selectedBrand = undefined;
    this.selectedModels = [];
    this.models.set([]);

    this.selectedStyle = undefined;

    this.selectedGenders = [];
    this.selectedMovements = [];
    this.selectedConditions = [];

    this.year = undefined;
    this.minPrice = DEFAULT_MIN_PRICE;
    this.maxPrice = DEFAULT_MAX_PRICE;
    this.originalBox = false;
    this.originalPapers = false;
    this.shipping = false;

    await this.applyFilters();
  }

  // Paginación
  changePage(page: number) {

    if (page < 1) return;

    if (page > this.totalPages()) return;

    this.currentPage.set(page);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

  }

  // Favoritos
  async toggleFavorite(article: IArticleSummary) {
    const originalStatus = article.is_favorite;

    try {
      article.is_favorite = !article.is_favorite;
      this.filteredArticles.update(v => [...v]);

      if (originalStatus) {
        await this.articleService.removeFavorite(article.id);
        toast.success('Eliminado de tus favoritos correctamente');
      } else {
        await this.articleService.addFavorite(article.id);
        toast.success('Añadido a tus favoritos correctamente');
      }

    } catch (e: any) {
      article.is_favorite = originalStatus;
      this.filteredArticles.update(v => [...v]);

      console.error('Error al gestionar favoritos:', e);

      const errorMessage = e?.error?.message || e?.message || 'Error inesperado del servidor';

      toast.error(`No se pudo actualizar tus favoritos: ${errorMessage}`);
    }
  }
}