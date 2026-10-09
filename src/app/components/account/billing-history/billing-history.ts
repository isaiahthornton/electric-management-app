import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth-service';
import { BillService } from '../../../services/bill-service';
import { Bill, BillStatus } from '../../../interfaces/bill';

type BillFilter = 'all' | BillStatus;


@Component({
  imports: [CurrencyPipe, DatePipe, TitleCasePipe, RouterLink],
  selector: 'app-billing-history',
  styleUrl: './billing-history.css',
  templateUrl: './billing-history.html',
})
export class BillingHistory {
  private authService = inject(AuthService);
  private billService = inject(BillService);

  protected readonly bills = signal<Bill[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');

  // Filter for the table; default to all bills
  protected readonly filters: BillFilter[] = ['all', 'paid', 'unpaid', 'overdue'];
  protected readonly activeFilter = signal<BillFilter>('all');

  // re-runs whenever the bills or activeFilter signals change
  protected readonly filteredBills = computed(() => {
    const filter = this.activeFilter();
    return filter === 'all' ? this.bills() : this.bills().filter((b) => b.status === filter)
  });

  ngOnInit(): void {
    const customerId = this.authService.getCurrentUser()?.customerId;
    if (!customerId) {
      this.errorMessage.set('No customer ID found for the logged-in user.');
      this.isLoading.set(false);
      return;
    }

    this.billService.getBillsByCustomer(customerId).subscribe({
      next: (bills) => {
        this.bills.set(bills);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching bills:', err);
        this.errorMessage.set('Failed to load billing history. Please try again later.');
        this.isLoading.set(false);
      },
    });
  }
}
