import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { CustomerService } from '../../../services/customer-service';
import { RatePlanService } from '../../../services/rate-plan-service';
import { BillService } from '../../../services/bill-service';
import { AccountStatus, Customer } from '../../../interfaces/customer';
import { RatePlan } from '../../../interfaces/rate-plan';
import { Bill } from '../../../interfaces/bill';

// One table row: the customer plus data joined in from other collections.
// Only this page uses it, so it lives here rather than in interfaces/.
interface CustomerRow {
  customer: Customer;
  planName: string;
  balance: number;
}

/**
 * Admin customers (/admin/customers).
 * Search and filter all customer accounts and change their status.
 */
@Component({
  imports: [CurrencyPipe, TitleCasePipe, FormsModule],
  selector: 'app-admin-customers',
  styleUrl: './admin-customers.css',
  templateUrl: './admin-customers.html',
})
export class AdminCustomers implements OnInit {
  private customerService = inject(CustomerService);
  private ratePlanService = inject(RatePlanService);
  private billService = inject(BillService);

  protected readonly customers = signal<Customer[]>([]);
  protected readonly plans = signal<RatePlan[]>([]);
  protected readonly bills = signal<Bill[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');

  // --- Filters ---
  protected readonly statuses: AccountStatus[] = ['active', 'inactive', 'suspended', 'closed'];
  protected readonly searchTerm = signal('');
  protected readonly statusFilter = signal<AccountStatus | 'all'>('all');

  // Which row is saving, and a short confirmation after it saves
  protected readonly savingId = signal<number | null>(null);
  protected readonly savedMessage = signal('');

  // --- Joined rows ---
  protected readonly rows = computed<CustomerRow[]>(() => {
    // Lookup table: plan id → plan name, so each row doesn't search the whole list
    const planNames = new Map(this.plans().map((p) => [p.id, p.name]));

    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return this.customers()
      .filter((c) => status === 'all' || c.status === status)
      .filter((c) => {
        if (!term) return true;
        // Match against anything an admin might type
        const haystack = `${c.firstName} ${c.lastName} ${c.accountNumber} ${c.email} ${c.serviceAddress}`;
        return haystack.toLowerCase().includes(term);
      })
      .map((c) => ({
        customer: c,
        planName: planNames.get(c.ratePlanId) ?? 'Unknown plan',
        balance: this.bills()
          .filter((b) => b.customerId === c.id && b.status !== 'paid')
          .reduce((total, b) => total + b.amountDue, 0),
      }));
  });

  ngOnInit(): void {
    forkJoin({
      customers: this.customerService.getAllCustomers(),
      plans: this.ratePlanService.getRatePlans(),
      bills: this.billService.getAllBills(),
    }).subscribe({
      next: ({ customers, plans, bills }) => {
        this.customers.set(customers);
        this.plans.set(plans);
        this.bills.set(bills);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Customers load failed:', err);
        this.errorMessage.set('Could not load customers. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  changeStatus(customer: Customer, event: Event): void {
    // The dropdown's value is a plain string; we know it's one of our statuses
    const newStatus = (event.target as HTMLSelectElement).value as AccountStatus;

    this.savingId.set(customer.id);
    this.savedMessage.set('');

    this.customerService.updateCustomerStatus(customer.id, newStatus).subscribe({
      next: (updated) => {
        // Swap the saved customer into the list; every other customer stays the same
        this.customers.update((list) => list.map((c) => (c.id === updated.id ? updated : c)));
        this.savedMessage.set(`${updated.firstName} ${updated.lastName} is now ${updated.status}.`);
        this.savingId.set(null);
      },
      error: (err) => {
        console.error('Status update failed:', err);
        this.errorMessage.set('Could not update status. Please try again.');
        this.savingId.set(null);
      },
    });
  }
}
