import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { StatsService } from '../../../../services/stats.service';
import { toast } from 'ngx-sonner';
import { AgCharts } from 'ag-charts-angular';
import { AgChartOptions, AllCommunityModule, ModuleRegistry } from 'ag-charts-community';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-admin-stats',
  standalone: true,
  imports: [AgCharts, ButtonComponent],
  templateUrl: './admin-stats.component.html',
  styleUrl: './admin-stats.component.css',
})
export class AdminStatsComponent implements OnInit {
  private statsService = inject(StatsService);
  reportsByStatus = signal<{ status: string, total: number }[]>([]);
  usersByStatus = signal<{ status: string, total: number }[]>([]);
  articlesByDate = signal<{ date: string, total: number }[]>([]);
  sessionByDate = signal<{ date: string, total: number }[]>([]);
  activePeriod = signal<string>('30d');

  totalUsers = computed(() => {
    return this.usersByStatus().reduce((acc, item) => acc + item.total, 0);
  });

  totalReports = computed(() => {
    return this.reportsByStatus().reduce((acc, item) => acc + item.total, 0);
  });

  articlesChartOptions = signal<AgChartOptions>({});
  sessionsChartOptions = signal<AgChartOptions>({});

  private getBackendErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const backendError = error.error;

      if (typeof backendError === 'string') {
        return backendError;
      }

      if (Array.isArray(backendError)) {
        return backendError.join(', ');
      }

      return backendError?.message || backendError?.error || fallback;
    }

    return fallback;
  }

  ngOnInit() {
    this.loadStats();
  }

  async loadStats() {
    try {

      const reportsByStatusResponse = await this.statsService.getReportsByStatus(this.activePeriod());
      this.reportsByStatus.set(reportsByStatusResponse);

      const usersByStatusResponse = await this.statsService.getUsersByStatus(this.activePeriod());
      this.usersByStatus.set(usersByStatusResponse);

      const articlesByDateResponse = await this.statsService.getArticlesByDate(this.activePeriod());
      this.articlesByDate.set(articlesByDateResponse);

      const sessionByDateResponse = await this.statsService.getSessionByDate(this.activePeriod());
      this.sessionByDate.set(sessionByDateResponse);


      this.updateChart();

    } catch (error) {
      toast.error(this.getBackendErrorMessage(error, 'Error al cargar las estadísticas'))
    }
  }


  async onPeriodChange(period: string): Promise<void> {

    try {
      this.activePeriod.set(period);
  
      const reportsByStatusResponse = await this.statsService.getReportsByStatus(period);
      this.reportsByStatus.set(reportsByStatusResponse);
  
      const usersByStatusResponse = await this.statsService.getUsersByStatus(period);
      this.usersByStatus.set(usersByStatusResponse);
  
      const articlesByDateResponse = await this.statsService.getArticlesByDate(period);
      this.articlesByDate.set(articlesByDateResponse);
  
      const sessionByDateResponse = await this.statsService.getSessionByDate(period);
      this.sessionByDate.set(sessionByDateResponse);
  
      this.updateChart();
      
    } catch (error) {
      toast.error(this.getBackendErrorMessage(error, 'Error al cambiar el período'))
      
    }
  }


  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      'ACTIVE': 'Perfiles activos',
      'BLOCKED': 'Perfiles bloqueados',
      'DELETED': 'Perfiles de baja',
      'PENDING': 'Reportes pendientes',
      'RESOLVED': 'Reportes resueltos',
      'UNDER REVIEW': 'Reportes en revisión'
    };
    return labels[status] ?? status;
  }

  statusIcon(status: string): string {
    const icons: Record<string, string> = {
      'ACTIVE': 'bi bi-person-check',
      'BLOCKED': 'bi bi-person-slash',
      'DELETED': 'bi bi-person-x',
      'PENDING': 'bi bi-clock',
      'RESOLVED': 'bi bi-check-circle',
      'UNDER REVIEW': 'bi bi-arrow-repeat'
    };
    return icons[status] ?? 'bi bi-circle';
  }

  statusColorClass(status: string): string {
    const colors: Record<string, string> = {
      'ACTIVE': 'bg-active',
      'BLOCKED': 'bg-blocked',
      'PENDING': 'bg-blocked',
      'RESOLVED': 'bg-active',
    };
    return colors[status] ?? 'bg-light';
  }

  statusColorText(status: string): string {
    const colors: Record<string, string> = {
      'ACTIVE': 'text-success',
      'BLOCKED': 'text-blocked',
      'DELETED': 'text-secondary',
      'PENDING': 'text-blocked',
      'RESOLVED': 'text-success',
      'UNDER REVIEW': 'text-secondary'
    };
    return colors[status] ?? 'text-primary';
  }

  private updateChart() {
    this.articlesChartOptions.set({
      data: this.articlesByDate(),
      series: [{
        type: 'area',
        xKey: 'date',
        yKey: 'total',
        fill: 'rgba(59, 130, 246, 0.2)',
        stroke: '#3b82f6',

      }]
    });

    this.sessionsChartOptions.set({
      data: this.sessionByDate(),
      series: [{
        type: 'area',
        xKey: 'date',
        yKey: 'total',
        fill: 'rgba(16, 185, 129, 0.2)',
        stroke: '#10b981',
      }]
    });
  }


}

