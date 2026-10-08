import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';

import { AuthService } from '../../../services/auth-service';
import { MeterService } from '../../../services/meter-service';
import { MonthlyUsage } from '../../../interfaces/monthly-usage';
import { calculateMonthlyUsage } from '../../../utils/usage';

/**
 * Usage history (/account/usage).
 * Shows the last 12 months as a bar chart plus a table of the same numbers.
 */
@Component({
  imports: [DatePipe, DecimalPipe],
  selector: 'app-usage-history',
  styleUrl: './usage-history.css',
  templateUrl: './usage-history.html',
})
export class UsageHistory implements OnInit {
  private authService = inject(AuthService);
  private meterService = inject(MeterService);

  protected readonly monthlyUsage = signal<MonthlyUsage[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');

  // --- Summary numbers ---
  protected readonly totalKwh = computed(() =>
    this.monthlyUsage().reduce((total, m) => total + m.kwh, 0),
  );

  protected readonly averageKwh = computed(() => {
    const months = this.monthlyUsage().length;
    return months > 0 ? this.totalKwh() / months : 0;
  });

  // Keep whichever month is higher as we go; null if there's no data
  protected readonly peakMonth = computed(() =>
    this.monthlyUsage().reduce<MonthlyUsage | null>(
      (peak, m) => (!peak || m.kwh > peak.kwh ? m : peak),
      null,
    ),
  );

  // Every bar's height is a percentage of the tallest month
  protected readonly maxKwh = computed(() => this.peakMonth()?.kwh ?? 0);

  ngOnInit(): void {
    const customerId = this.authService.getCurrentUser()?.customerId;
    if (customerId == null) {
      this.errorMessage.set('No customer account is linked to this login.');
      this.isLoading.set(false);
      return;
    }

    this.meterService.getReadingsByCustomer(customerId).subscribe({
      next: (readings) => {
        // Readings are running totals; convert them to kWh per month
        this.monthlyUsage.set(calculateMonthlyUsage(readings));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Usage load failed:', err);
        this.errorMessage.set('Could not load your usage history. Please try again.');
        this.isLoading.set(false);
      },
    });
  }
}
