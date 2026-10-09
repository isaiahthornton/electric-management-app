import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { CustomerService } from '../../../services/customer-service';
import { BillService } from '../../../services/bill-service';
import { OutageService } from '../../../services/outage-service';
import { Customer } from '../../../interfaces/customer';
import { Bill } from '../../../interfaces/bill';
import { Outage } from '../../../interfaces/outage';
import { StatusLabelPipe } from '../../../pipes/status-label-pipe';

/**
 * Admin dashboard (/admin).
 * Company-wide numbers: customers, money owed, usage billed, and outage response.
 */
@Component({
  imports: [CurrencyPipe, DatePipe, DecimalPipe, RouterLink, StatusLabelPipe],
  selector: 'app-admin-dashboard',
  styleUrl: './admin-dashboard.css',
  templateUrl: './admin-dashboard.html',
})
export class AdminDashboard implements OnInit {
  private customerService = inject(CustomerService);
  private billService = inject(BillService);
  private outageService = inject(OutageService);

  protected readonly customers = signal<Customer[]>([]);
  protected readonly bills = signal<Bill[]>([]);
  protected readonly outages = signal<Outage[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');

  // --- Customers ---
  protected readonly activeCustomerCount = computed(
    () => this.customers().filter((c) => c.status === 'active').length,
  );

  // --- Billing ---
  protected readonly openBills = computed(() => this.bills().filter((b) => b.status !== 'paid'));
  protected readonly outstandingBalance = computed(() =>
    this.openBills().reduce((total, b) => total + b.amountDue, 0),
  );
  protected readonly overdueCount = computed(
    () => this.openBills().filter((b) => b.status === 'overdue').length,
  );

  // Bills come back newest first, so bills()[0] is in the latest period
  protected readonly latestPeriod = computed(() => this.bills()[0]?.periodStart ?? null);
  protected readonly latestPeriodKwh = computed(() =>
    this.bills()
      .filter((b) => b.periodStart === this.latestPeriod())
      .reduce((total, b) => total + b.kwhUsed, 0),
  );

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
      customers: this.customerService.getAllCustomers(),
      bills: this.billService.getAllBills(),
      outages: this.outageService.getAllOutages(),
    }).subscribe({
      next: ({ customers, bills, outages }) => {
        this.customers.set(customers);
        this.bills.set(bills);
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
