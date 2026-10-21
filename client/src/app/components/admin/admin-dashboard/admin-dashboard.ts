import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AdminInsightService } from '../../../services/admin-insight-service';
import { OutageService } from '../../../services/outage-service';
import { AdminKpis, UsageTrendPoint } from '../../../interfaces/admin-insight';
import { Outage } from '../../../interfaces/outage';
import { StatusLabelPipe } from '../../../pipes/status-label-pipe';
import { StatusBadge } from '../../../directives/status-badge';

/**
 * Admin dashboard (/admin).
 * Company-wide numbers (KPIs) and the monthly usage chart are calculated by the database
 * (a SQL view and a stored procedure); the open outages list comes from the outages endpoint.
 */
@Component({
  imports: [CurrencyPipe, DatePipe, DecimalPipe, RouterLink, StatusLabelPipe, StatusBadge],
  selector: 'app-admin-dashboard',
  styleUrl: './admin-dashboard.css',
  templateUrl: './admin-dashboard.html',
})
export class AdminDashboard implements OnInit {
  private insightService = inject(AdminInsightService);
  private outageService = inject(OutageService);

  protected readonly kpis = signal<AdminKpis | null>(null);
  protected readonly trend = signal<UsageTrendPoint[]>([]);
  protected readonly outages = signal<Outage[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');

  // --- Chart: each bar is a percentage of the biggest month, so the tallest bar fills the chart ---
  protected readonly maxKwh = computed(() => Math.max(1, ...this.trend().map((p) => p.totalKwh)));
  protected barHeight(point: UsageTrendPoint): number {
    return (point.totalKwh / this.maxKwh()) * 100;
  }

  // --- Outages ---
  protected readonly activeOutages = computed(() => this.outages().filter((o) => o.status !== 'resolved'));

  // Average time from report to fix, in hours. null if nothing has been resolved yet.
  protected readonly avgResolutionHours = computed(() => {
    const resolved = this.outages().filter((o) => o.timeResolved !== null);
    if (resolved.length === 0) return null;
    const totalMs = resolved.reduce(
      (total, o) =>
        total + (new Date(o.timeResolved!).getTime() - new Date(o.timeReported).getTime()),
      0,
    );
    return totalMs / resolved.length / (1000 * 60 * 60); // milliseconds → hours
  });

  ngOnInit(): void {
    forkJoin({
      kpis: this.insightService.getKpis(),
      trend: this.insightService.getUsageTrend(12),
      outages: this.outageService.getAllOutages(),
    }).subscribe({
      next: ({ kpis, trend, outages }) => {
        this.kpis.set(kpis);
        this.trend.set(trend);
        this.outages.set(outages);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Admin dashboard load failed:', err);
        this.errorMessage.set('Could not load dashboard data. Please try again.');
        this.isLoading.set(false);
      },
    });
  }
}
