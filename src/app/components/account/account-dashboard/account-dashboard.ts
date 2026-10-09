import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { StatusLabelPipe } from '../../../pipes/status-label-pipe';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../../services/auth-service';
import { CustomerService } from '../../../services/customer-service';
import { BillService } from '../../../services/bill-service';
import { MeterService } from '../../../services/meter-service';
import { OutageService } from '../../../services/outage-service';
import { Customer } from '../../../interfaces/customer';
import { Bill } from '../../../interfaces/bill';
import { MeterReading } from '../../../interfaces/meter-reading';
import { Outage } from '../../../interfaces/outage';
import { calculateMonthlyUsage } from '../../../utils/usage';

/**
 * Customer dashboard (/account).
 * Loads everything for the logged-in customer in one go, then derives
 * the balance, usage trend, and any open outages from that data.
 */
@Component({
  imports: [CurrencyPipe, DatePipe, DecimalPipe, RouterLink, StatusLabelPipe],
  selector: 'app-account-dashboard',
  styleUrl: './account-dashboard.css',
  templateUrl: './account-dashboard.html',
})
export class AccountDashboard implements OnInit {
  private authService = inject(AuthService);
  private customerService = inject(CustomerService);
  private billService = inject(BillService);
  private meterService = inject(MeterService);
  private outageService = inject(OutageService);

  // --- Data from the API (filled once in ngOnInit) ---
  protected readonly customer = signal<Customer | null>(null);
  protected readonly bills = signal<Bill[]>([]);
  protected readonly readings = signal<MeterReading[]>([]);
  protected readonly outages = signal<Outage[]>([]);

  // Starts true because the page fetches data as soon as it opens
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');

  // --- Billing ---
  // Unpaid + overdue bills. Everything below in this section builds off this.
  protected readonly openBills = computed(() => this.bills().filter((b) => b.status !== 'paid'));

  protected readonly balanceDue = computed(() =>
    this.openBills().reduce((total, b) => total + b.amountDue, 0),
  );

  // Show the soonest due date, since that's the one the customer needs to act on.
  // Copy before sorting so we don't reorder the signal's array in place.
  protected readonly nextDueDate = computed(() => {
    const sorted = [...this.openBills()].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    return sorted[0]?.dueDate ?? null; // null = nothing owed
  });

  protected readonly hasOverdue = computed(() => this.openBills().some((b) => b.status === 'overdue'));

  // --- Usage ---
  // Meter readings are running totals, so usage has to be calculated (see utils/usage.ts)
  protected readonly monthlyUsage = computed(() => calculateMonthlyUsage(this.readings()));
  protected readonly thisMonth = computed(() => this.monthlyUsage().at(-1) ?? null);
  protected readonly lastMonth = computed(() => this.monthlyUsage().at(-2) ?? null);

  // % change vs last month. Positive = used more, negative = used less.
  // Returns null when there isn't enough data (or last month was 0, to avoid dividing by zero).
  protected readonly usageChange = computed(() => {
    const current = this.thisMonth();
    const previous = this.lastMonth();
    if (!current || !previous || previous.kwh === 0) return null;
    return ((current.kwh - previous.kwh) / previous.kwh) * 100;
  });

  // --- Outages ---
  // Anything not resolved gets a banner at the top of the page
  protected readonly activeOutages = computed(() => this.outages().filter((o) => o.status !== 'resolved'));

  ngOnInit(): void {
    const customerId = this.authService.getCurrentUser()?.customerId;

    // Safety check: admins have customerId null. The guard should already stop
    // them from getting here, but this avoids firing requests with a bad id.
    if (customerId == null) {
      this.errorMessage.set('No customer account is linked to this login.');
      this.isLoading.set(false);
      return;
    }

    // Fire all requests in parallel; next only runs once every one has come back.
    // If any of them fails, we land in error instead, so one message covers the whole page.
    forkJoin({
      customer: this.customerService.getCustomerById(customerId),
      bills: this.billService.getBillsByCustomer(customerId),
      outages: this.outageService.getOutagesByCustomer(customerId),

      // Readings belong to a meter, not a customer, so find the meter first.
      // If there's no meter, of([]) hands forkJoin an empty list instead of hanging.
      readings: this.meterService.getReadingsByCustomer(customerId),
    }).subscribe({
      next: (data) => {
        // Setting these triggers every computed() above, which updates the template
        this.customer.set(data.customer);
        this.bills.set(data.bills);
        this.outages.set(data.outages);
        this.readings.set(data.readings);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Dashboard load failed:', err); // full error for debugging (F12)
        this.errorMessage.set('Could not load your account. Please try again.'); // friendly version for the user
        this.isLoading.set(false);
      },
    });
  }
}
