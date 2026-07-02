import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { StatsService } from '../../services/stats.service';
import { toast } from 'ngx-sonner';
import { AgCharts } from 'ag-charts-angular';
import { AgChartOptions, AgBarSeriesOptions, AllCommunityModule, ModuleRegistry } from 'ag-charts-community';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-admin-stats',
  imports: [AgCharts],
  templateUrl: './admin-stats.component.html',
  styleUrl: './admin-stats.component.css',
})
export class AdminStatsComponent implements OnInit {
  private statsService = inject(StatsService);
  publishedArticles = signal<number>(0);
  soldArticles = signal<number>(0);
  activeUsers = signal<number>(0);
  managedReports = signal<number>(0);
  chartOptions = signal<AgChartOptions>({});

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
      const publishedResponse = await this.statsService.publishedArticles();
      this.publishedArticles.set(publishedResponse.total);

      const soldResponse = await this.statsService.soldArticles();
      this.soldArticles.set(soldResponse.total);

      const activeResponse = await this.statsService.activeUsers();
      this.activeUsers.set(activeResponse.total);

      const managedResponse = await this.statsService.managedReports();
      this.managedReports.set(managedResponse.total);

      this.updateChart();

    } catch (error) {
      toast.error (this.getBackendErrorMessage(error, 'Error al cargar las estadísticas'))
    }
  }

  private updateChart() {
    console.log('updateChart llamado', {
        published: this.publishedArticles(),
        sold: this.soldArticles(),
        active: this.activeUsers(),
        managed: this.managedReports()
    });
    this.chartOptions.set({
      data: [
        { label: 'Publicados', value: this.publishedArticles() },
        { label: 'Vendidos', value: this.soldArticles() },
        { label: 'Usuarios Activos', value: this.activeUsers() },
        { label: 'Reportes Gestionados', value: this.managedReports() }
      ],
      series: [{ type: 'bar', xKey: 'label', yKey: 'value' }],
    });
  }
 

}

