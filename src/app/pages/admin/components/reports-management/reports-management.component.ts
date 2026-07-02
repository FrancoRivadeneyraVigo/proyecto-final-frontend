import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReportService } from '../../../../services/report.service';
import {
  IReportsPaginatedResponse,
  ReportByType,
  ReportReason,
  ReportResolution,
  ReportStatus,
  ReportStatusFilter,
} from '../../../../shared/models/report.interface';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

const REASON_LABELS: Record<ReportReason, string> = {
  fake_item: 'Artículo falso',
  scam_attempt: 'Fraude',
  suspicious_price: 'Precio sospechoso',
  spam: 'Spam',
  inappropriate_content: 'Contenido inapropiado',
  other: 'Otro',
};

const REASON_OPTIONS: { value: ReportReason; label: string }[] = [
  { value: 'fake_item', label: REASON_LABELS.fake_item },
  { value: 'scam_attempt', label: REASON_LABELS.scam_attempt },
  { value: 'suspicious_price', label: REASON_LABELS.suspicious_price },
  { value: 'spam', label: REASON_LABELS.spam },
  { value: 'inappropriate_content', label: REASON_LABELS.inappropriate_content },
  { value: 'other', label: REASON_LABELS.other },
];

const STATUS_LABELS: Record<ReportStatus, string> = {
  PENDING: 'Pendiente',
  'UNDER REVIEW': 'En revisión',
  RESOLVED: 'Resuelto',
};

const RESOLUTION_LABELS: Record<ReportResolution, string> = {
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
};

const REPORT_TYPE_OPTIONS: { value: ReportByType; label: string }[] = [
  { value: 'articulo', label: 'Artículo' },
  { value: 'usuario', label: 'Usuario' },
];

@Component({
  selector: 'app-reports-management',
  imports: [ButtonComponent, DatePipe, RouterLink, FormsModule],
  templateUrl: './reports-management.component.html',
  styleUrl: './reports-management.component.css',
})
export class ReportsManagementComponent implements OnInit {
  private reportService = inject(ReportService);

  readonly pageSize = 10;
  readonly reasonOptions = REASON_OPTIONS;
  readonly reportTypeOptions = REPORT_TYPE_OPTIONS;

  response = signal<IReportsPaginatedResponse | null>(null);
  activeFilter = signal<ReportStatusFilter>('PENDING');
  currentPage = signal(1);
  loading = signal(false);

  searchTerm = signal('');
  selectedReason = signal<ReportReason | ''>('');
  selectedReportType = signal<ReportByType | ''>('');
  createdFrom = signal('');
  createdTo = signal('');

  reports = computed(() => this.response()?.data ?? []);

  ngOnInit(): void {
    this.loadReports();
  }

  async loadReports(page = 1): Promise<void> {
    this.currentPage.set(page);
    this.loading.set(true);
    try {
      const result = await this.reportService.getReports({
        status: this.activeFilter(),
        search: this.searchTerm(),
        reason: this.selectedReason() || undefined,
        byreportype: this.selectedReportType() || undefined,
        created_from: this.createdFrom() || undefined,
        created_to: this.createdTo() || undefined,
        page,
        limit: this.pageSize,
      });
      this.response.set(result);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
      this.response.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  onStatusChange(status: ReportStatusFilter): void {
    this.activeFilter.set(status);
    this.loadReports(1);
  }

  applyFilters(): void {
    this.loadReports(1);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedReason.set('');
    this.selectedReportType.set('');
    this.createdFrom.set('');
    this.createdTo.set('');
    this.loadReports(1);
  }

  goToPreviousPage(): void {
    if (this.currentPage() > 1) {
      this.loadReports(this.currentPage() - 1);
    }
  }

  goToNextPage(): void {
    const totalPages = this.response()?.total_pages ?? 1;
    if (this.currentPage() < totalPages) {
      this.loadReports(this.currentPage() + 1);
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

  isResolvedRejected(status: ReportStatus, resolution: ReportResolution | null): boolean {
    return status === 'RESOLVED' && resolution === 'REJECTED';
  }

  hasId(id: number | null | undefined): boolean {
    return id != null && id > 0;
  }
}
