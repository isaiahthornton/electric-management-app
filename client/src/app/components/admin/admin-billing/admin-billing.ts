import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { BillService } from '../../../services/bill-service';
import { CustomerService } from '../../../services/customer-service';
import { MeterService } from '../../../services/meter-service';
import { RatePlanService } from '../../../services/rate-plan-service';
import { Bill } from '../../../interfaces/bill';
import { Customer } from '../../../interfaces/customer';
import { Meter } from '../../../interfaces/meter';
import { MeterReading } from '../../../interfaces/meter-reading';
import { RatePlan } from '../../../interfaces/rate-plan';
import { buildBill, periodBounds } from '../../../utils/billing';

interface PeriodSummary {
  period: string;
  billCount: number;
  kwh: number;
  billed: number;
  collected: number;
  outstanding: number;
}

/**
 * Billing (/admin/billing).
 * Month-by-month totals, plus a billing run that generates bills from meter readings.
 */
@Component({
  imports: [CurrencyPipe, DatePipe, DecimalPipe, FormsModule],
  selector: 'app-admin-billing',
  styleUrl: './admin-billing.css',
  templateUrl: './admin-billing.html',
})
export class AdminBilling implements OnInit {
  private billService = inject(BillService);
  private customerService = inject(CustomerService);
  private meterService = inject(MeterService);
  private ratePlanService = inject(RatePlanService);

  protected readonly bills = signal<Bill[]>([]);
  protected readonly customers = signal<Customer[]>([]);
  protected readonly meters = signal<Meter[]>([]);
  protected readonly readings = signal<MeterReading[]>([]);
  protected readonly plans = signal<RatePlan[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');

  // Billing run state
  protected readonly billingMonth = signal(''); // 'YYYY-MM' from <input type="month">
  protected readonly isRunning = signal(false);
  protected readonly runMessage = signal('');
  protected readonly skipped = signal<string[]>([]);

  // --- Period summaries: group bills by month, newest first ---
  protected readonly periodSummaries = computed<PeriodSummary[]>(() => {
    const groups = new Map<string, Bill[]>();
    for (const b of this.bills()) {
      groups.set(b.periodStart, [...(groups.get(b.periodStart) ?? []), b]);
    }

    return [...groups.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([period, bills]) => {
        const billed = bills.reduce((t, b) => t + b.amountDue, 0);
        const collected = bills.filter((b) => b.status === 'paid').reduce((t, b) => t + b.amountDue, 0);
        return {
          period,
          billCount: bills.length,
          kwh: bills.reduce((t, b) => t + b.kwhUsed, 0),
          billed,
          collected,
          outstanding: billed - collected,
        };
      });
  });

  ngOnInit(): void {
    forkJoin({
      bills: this.billService.getAllBills(),
      customers: this.customerService.getAllCustomers(),
      meters: this.meterService.getAllMeters(),
      readings: this.meterService.getAllReadings(),
      plans: this.ratePlanService.getRatePlans(),
    }).subscribe({
      next: ({ bills, customers, meters, readings, plans }) => {
        this.bills.set(bills);
        this.customers.set(customers);
        this.meters.set(meters);
        this.readings.set(readings);
        this.plans.set(plans);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Billing load failed:', err);
        this.errorMessage.set('Could not load billing data. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  runBilling(): void {
    const month = this.billingMonth();
    this.runMessage.set('');
    this.skipped.set([]);
    if (!month) {
      this.runMessage.set('Pick a month to bill.');
      return;
    }

    const { start, nextStart } = periodBounds(month);
    const planById = new Map(this.plans().map((p) => [p.id, p]));
    const newBills: Omit<Bill, 'id'>[] = [];
    const skipped: string[] = [];

    for (const c of this.customers()) {
      const name = `${c.firstName} ${c.lastName}`;

      if (c.status !== 'active') {
        skipped.push(`${name}: account is ${c.status}`);
        continue;
      }
      if (this.bills().some((b) => b.customerId === c.id && b.periodStart === start)) {
        skipped.push(`${name}: already billed for this month`);
        continue;
      }

      // Usage for the month = reading on the 1st of next month − reading on the 1st of this month
      const meter = this.meters().find((m) => m.customerId === c.id);
      const startReading = this.readings().find((r) => r.meterId === meter?.id && r.readingDate === start);
      const endReading = this.readings().find((r) => r.meterId === meter?.id && r.readingDate === nextStart);
      const plan = planById.get(c.ratePlanId);

      if (!startReading || !endReading) {
        skipped.push(`${name}: needs readings on ${start} and ${nextStart}`);
        continue;
      }
      if (!plan) {
        skipped.push(`${name}: no rate plan`);
        continue;
      }

      newBills.push(buildBill(c.id, plan, startReading.readingValue, endReading.readingValue, month));
    }

    this.skipped.set(skipped);
    if (newBills.length === 0) {
      this.runMessage.set('No bills were created.');
      return;
    }

    // One POST per bill, all sent together; next runs once every bill is saved
    this.isRunning.set(true);
    forkJoin(newBills.map((bill) => this.billService.createBill(bill))).subscribe({
      next: (created) => {
        this.bills.update((list) => [...created, ...list]);
        this.runMessage.set(`Created ${created.length} bill(s) for ${month}.`);
        this.isRunning.set(false);
      },
      error: (err) => {
        console.error('Billing run failed:', err);
        this.runMessage.set('The billing run failed partway. Check db.json before running again.');
        this.isRunning.set(false);
      },
    });
  }
}
