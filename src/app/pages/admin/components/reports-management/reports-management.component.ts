import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ReportService } from '../../../../services/report.service';
import {
  IAdminReport,
  ReportReason,
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

@Component({
  selector: 'app-reports-management',
  imports: [ButtonComponent, DatePipe],
  templateUrl: './reports-management.component.html',
  styleUrl: './reports-management.component.css',
})
export class ReportsManagementComponent implements OnInit {
  private reportService = inject(ReportService);

  reports = signal<IAdminReport[]>([]);
  activeFilter = signal<ReportStatusFilter>('PENDING');
  loading = signal(false);

  ngOnInit(): void {
    this.loadReports('PENDING');
  }

  async loadReports(filter: ReportStatusFilter): Promise<void> {
    this.activeFilter.set(filter);
    this.loading.set(true);
    try {
      const result = await this.reportService.getReports(filter);
      this.reports.set(result);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
      this.reports.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  getReasonLabel(reason: ReportReason): string {
    return REASON_LABELS[reason] ?? reason;
  }
}
