import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toast } from 'ngx-sonner';
import { ReportService } from '../../../services/report.service';
import {
  IReportDetail,
  ReportReason,
  ReportResolution,
  ReportStatus,
} from '../../../shared/models/report.interface';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { NavbarComponent } from '../../../shared/layout/navbar/navbar.component';
import { FooterComponent } from '../../../shared/layout/footer/footer.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { getHttpErrorMessage } from '../../../shared/utils/http-error-message';

const REASON_LABELS: Record<ReportReason, string> = {
  fake_item: 'Artículo falso',
  scam_attempt: 'Fraude',
  suspicious_price: 'Precio sospechoso',
  spam: 'Spam',
  inappropriate_content: 'Contenido inapropiado',
  other: 'Otro',
};

const STATUS_LABELS: Record<ReportStatus, string> = {
  PENDING: 'Pendiente',
  'UNDER REVIEW': 'En revisión',
  RESOLVED: 'Resuelto',
};

const RESOLUTION_LABELS: Record<ReportResolution, string> = {
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
};

type ConfirmAction = 'reject' | 'validate' | 'underReview' | null;

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
    window.scrollTo(0, 0);
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadReport(id);
  }

  async loadReport(id: number): Promise<void> {
    this.loading.set(true);
    try {
      const result = await this.reportService.getReportDetail(id);
      this.report.set(result);
    } catch (error) {
      toast.error(getHttpErrorMessage(error, 'No se pudo cargar el reporte. Inténtalo de nuevo más tarde.'));
      this.report.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  getReasonLabel(reason: ReportReason): string {
    return REASON_LABELS[reason] ?? reason;
  }

  getStatusLabel(status: ReportStatus, resolution: ReportResolution | null = null): string {
    if (status === 'RESOLVED' && resolution) {
      return RESOLUTION_LABELS[resolution] ?? STATUS_LABELS.RESOLVED;
    }
    return STATUS_LABELS[status] ?? status;
  }

  canModerate(status: ReportStatus): boolean {
    return status === 'UNDER REVIEW';
  }

  canMarkUnderReview(status: ReportStatus): boolean {
    return status === 'PENDING';
  }

  isResolvedRejected(status: ReportStatus, resolution: ReportResolution | null): boolean {
    return status === 'RESOLVED' && resolution === 'REJECTED';
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
          await this.reportService.withdrawReportedArticle(report.article_id, report.id);
          toast.success('Artículo retirado correctamente');
          break;
        case 'underReview':
          await this.reportService.markReportUnderReview(report.id);
          toast.success('Reporte marcado en revisión');
          break;
      }
      await this.loadReport(report.id);
      this.confirmAction.set(null);
    } catch (error) {
      toast.error(getHttpErrorMessage(error, 'No se pudo completar la acción. Inténtalo de nuevo.'));
    } finally {
      this.processingAction.set(false);
    }
  }
}
