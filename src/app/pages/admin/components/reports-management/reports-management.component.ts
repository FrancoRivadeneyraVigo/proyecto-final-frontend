import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ReportService } from '../../../../services/report.service';
import {
  IReportsPaginatedResponse,
  ReportReason,
  ReportStatusFilter,
} from '../../../../shared/models/report.interface';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { RouterLink } from '@angular/router';

const REASON_LABELS: Record<ReportReason, string> = {
  fake_item: 'Artículo falso',
  scam_attempt: 'Fraude',
  suspicious_price: 'Precio sospechoso',
  spam: 'Spam',
  inappropriate_content: 'Contenido inapropiado',
  other: 'Otro',
};

@Component({
  selector: 'app-reports-management',
  imports: [ButtonComponent, DatePipe, RouterLink],
  templateUrl: './reports-management.component.html',
  styleUrl: './reports-management.component.css',
})
export class ReportsManagementComponent implements OnInit {
  private reportService = inject(ReportService);

  readonly pageSize = 10;

  response = signal<IReportsPaginatedResponse | null>(null);
  activeFilter = signal<ReportStatusFilter>('PENDING');
  currentPage = signal(1);
  loading = signal(false);

  reports = computed(() => this.response()?.data ?? []);

  ngOnInit(): void {
    this.loadReports('PENDING');
  }

  async loadReports(filter: ReportStatusFilter, page = 1): Promise<void> {
    this.activeFilter.set(filter);
    this.currentPage.set(page);
    this.loading.set(true);
    try {
      const result = await this.reportService.getReports(filter, page, this.pageSize);
      this.response.set(result);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
      this.response.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage() > 1) {
      this.loadReports(this.activeFilter(), this.currentPage() - 1);
    }
  }

  goToNextPage(): void {
    const totalPages = this.response()?.total_pages ?? 1;
    if (this.currentPage() < totalPages) {
      this.loadReports(this.activeFilter(), this.currentPage() + 1);
    }
  }

  getReasonLabel(reason: ReportReason): string {
    return REASON_LABELS[reason] ?? reason;
  }
}
