import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { ReportService } from '../../../services/report.service';
import { AuthService } from '../../../services/auth.service';
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
    FormsModule,
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
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  report = signal<IReportDetail | null>(null);
  loading = signal(true);
  confirmAction = signal<ConfirmAction>(null);
  processingAction = signal(false);
  editingModeratorNote = signal(false);
  savingModeratorNote = signal(false);
  moderatorNoteDraft = signal('');

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadReport(id);
  }

  async loadReport(id: number): Promise<void> {
    this.loading.set(true);
    try {
      const result = await this.reportService.getReportDetail(id);
      this.report.set(result);
      this.moderatorNoteDraft.set(result.moderator_note ?? '');
      this.editingModeratorNote.set(false);
    } catch (error) {
      toast.error(getHttpErrorMessage(error, 'No se pudo cargar el reporte. Inténtalo de nuevo más tarde.'));
      this.report.set(null);
      this.moderatorNoteDraft.set('');
      this.editingModeratorNote.set(false);
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

  hasId(id: number | null | undefined): boolean {
    return id != null && id > 0;
  }

  isArticleReport(report: IReportDetail): boolean {
    return this.hasId(report.article_id);
  }

  isUserReport(report: IReportDetail): boolean {
    return this.hasId(report.reported_user_id) && !this.hasId(report.article_id);
  }

  isResolved(report: IReportDetail): boolean {
    return report.status === 'RESOLVED' || report.resolved_at != null;
  }

  canModerateRole(): boolean {
    const role = this.authService.currentUser()?.rol;
    return role === 'admin' || role === 'moderator';
  }

  canModerate(report: IReportDetail): boolean {
    return this.canModerateRole() && !this.isResolved(report) && report.status === 'UNDER REVIEW';
  }

  canEditModeratorNote(report: IReportDetail): boolean {
    return this.canModerateRole() && report.status === 'UNDER REVIEW';
  }

  canMarkUnderReview(report: IReportDetail): boolean {
    return this.canModerateRole() && !this.isResolved(report) && report.status === 'PENDING';
  }

  canValidate(report: IReportDetail): boolean {
    return this.canModerate(report) && (this.isArticleReport(report) || this.isUserReport(report));
  }

  getValidateLabel(report: IReportDetail): string {
    return this.isUserReport(report) ? 'Bloquear usuario' : 'Retirar artículo';
  }

  getValidateConfirmTitle(report: IReportDetail): string {
    return this.isUserReport(report) ? '¿Bloquear a este usuario?' : 'Validar reporte';
  }

  getValidateConfirmMessage(report: IReportDetail): string {
    return this.isUserReport(report)
      ? 'Se bloqueará el acceso del usuario y el reporte se cerrará como aprobado.'
      : '¿Estás seguro que deseas validar este reporte? Se retirará el artículo reportado.';
  }

  getValidateConfirmText(report: IReportDetail): string {
    return this.isUserReport(report) ? 'Bloquear usuario' : 'Validar';
  }

  isResolvedRejected(status: ReportStatus, resolution: ReportResolution | null): boolean {
    return status === 'RESOLVED' && resolution === 'REJECTED';
  }

  startEditingModeratorNote(report: IReportDetail): void {
    if (!this.canEditModeratorNote(report)) {
      return;
    }

    this.moderatorNoteDraft.set(report.moderator_note ?? '');
    this.editingModeratorNote.set(true);
  }

  updateModeratorNoteDraft(value: string): void {
    this.moderatorNoteDraft.set(value);
  }

  cancelEditingModeratorNote(): void {
    if (this.savingModeratorNote()) {
      return;
    }

    this.moderatorNoteDraft.set(this.report()?.moderator_note ?? '');
    this.editingModeratorNote.set(false);
  }

  hasModeratorNoteChanges(report: IReportDetail): boolean {
    return this.normalizeModeratorNote(this.moderatorNoteDraft()) !== this.normalizeModeratorNote(report.moderator_note);
  }

  async saveModeratorNote(): Promise<void> {
    const report = this.report();
    if (!report || this.savingModeratorNote()) {
      return;
    }

    if (!this.canEditModeratorNote(report)) {
      toast.error('Solo se puede editar el comentario cuando el reporte está en revisión.');
      this.cancelEditingModeratorNote();
      return;
    }

    const moderatorNote = this.normalizeModeratorNote(this.moderatorNoteDraft());
    if ((moderatorNote?.length ?? 0) > 1000) {
      toast.error('El comentario del moderador no puede superar los 1000 caracteres.');
      return;
    }

    this.savingModeratorNote.set(true);
    try {
      const updatedReport = await this.reportService.updateModeratorNote(report.id, {
        moderator_note: moderatorNote,
      });
      this.report.set(updatedReport);
      this.moderatorNoteDraft.set(updatedReport.moderator_note ?? '');
      this.editingModeratorNote.set(false);
      toast.success('Comentario del moderador actualizado correctamente');
    } catch (error) {
      toast.error(getHttpErrorMessage(error, 'No se pudo actualizar el comentario del moderador.'));
    } finally {
      this.savingModeratorNote.set(false);
    }
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
          if (this.isArticleReport(report)) {
            if (!this.hasId(report.article_id)) {
              toast.error('No se puede retirar el artículo: falta el ID del artículo.');
              return;
            }
            await this.reportService.withdrawReportedArticle(report.article_id!, report.id);
            toast.success('Artículo retirado correctamente');
          } else if (this.isUserReport(report)) {
            if (!this.hasId(report.reported_user_id)) {
              toast.error('No se puede bloquear el usuario: falta el ID del usuario reportado.');
              return;
            }
            await this.reportService.blockReportedUser(report.reported_user_id!, report.id);
            toast.success('Usuario bloqueado correctamente');
          } else {
            toast.error('No se puede validar este reporte.');
            return;
          }
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

  private normalizeModeratorNote(value: string | null | undefined): string | null {
    return value?.trim() || null;
  }
}
