import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toast } from 'ngx-sonner';
import { ReportService } from '../../../services/report.service';
import { IReportDetail, ReportReason } from '../../../shared/models/report.interface';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { NavbarComponent } from '../../../shared/layout/navbar/navbar.component';
import { FooterComponent } from '../../../shared/layout/footer/footer.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

const REASON_LABELS: Record<ReportReason, string> = {
  fake_item: 'Artículo falso',
  scam_attempt: 'Fraude',
  suspicious_price: 'Precio sospechoso',
  spam: 'Spam',
  inappropriate_content: 'Contenido inapropiado',
  other: 'Otro',
};

type ConfirmAction = 'reject' | 'validate' | null;

@Component({
  selector: 'app-report-detail',
  imports: [
    RouterLink,
    CommonModule,
    ButtonComponent,
    NavbarComponent,
    FooterComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './report-detail.component.html',
  styleUrl: './report-detail.component.css',
})
export class ReportDetailComponent {
  private reportService = inject(ReportService);
  private route = inject(ActivatedRoute);

  report = signal<IReportDetail | null>(null);
  loading = signal(true);
  confirmAction = signal<ConfirmAction>(null);
  processingAction = signal(false);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadReport(id);
  }

  async loadReport(id: number): Promise<void> {
    this.loading.set(true);
    try {
      const result = await this.reportService.getReportDetail(id);
      this.report.set(result);
    } catch (error) {
      console.error('Error al cargar el reporte:', error);
      this.report.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  getReasonLabel(reason: ReportReason): string {
    return REASON_LABELS[reason] ?? reason;
  }

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
    const report = this.report();
    const action = this.confirmAction();
    if (!report || !action) {
      return;
    }

    this.processingAction.set(true);
    try {
      switch (action) {
        case 'reject':
          await this.reportService.rejectReport(report.id);
          toast.success('Reporte rechazado correctamente');
          break;
        case 'validate':
          await this.reportService.withdrawReportedArticle(report.article_id);
          toast.success('Artículo retirado correctamente');
          break;
      }
      await this.loadReport(report.id);
      this.confirmAction.set(null);
    } catch (error) {
      console.error(`Error al ejecutar la acción "${action}":`, error);
      toast.error('No se pudo completar la acción. Inténtalo de nuevo.');
    } finally {
      this.processingAction.set(false);
    }
  }
}
