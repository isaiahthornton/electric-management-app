import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StatusBadge } from '../../../directives/status-badge';
import { StatusLabelPipe } from '../../../pipes/status-label-pipe';

import { AuthService } from '../../../services/auth-service';
import { BillService } from '../../../services/bill-service';
import { Bill } from '../../../interfaces/bill';

/**
 * Single bill (/account/billing/:id).
 * Shows the line items and lets the customer pay an open bill.
 */
@Component({
  imports: [CurrencyPipe, DatePipe, RouterLink, StatusBadge, StatusLabelPipe],
  selector: 'app-bill-detail',
  styleUrl: './bill-detail.css',
  templateUrl: './bill-detail.html',
})
export class BillDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private billService = inject(BillService);

  protected readonly bill = signal<Bill | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');

  // Payment state
  protected readonly isPaying = signal(false);
  protected readonly successMessage = signal('');

  ngOnInit(): void {
    // The :id from the URL comes in as a string, e.g. '12'
    const billId = Number(this.route.snapshot.paramMap.get('id'));
    const customerId = this.authService.getCurrentUser()?.customerId;

    this.billService.getBillById(billId).subscribe({
      next: (bill) => {
        // Don't show someone else's bill just because they typed its id in the URL
        if (bill.customerId !== customerId) {
          this.errorMessage.set('Bill not found.');
        } else {
          this.bill.set(bill);
        }
        this.isLoading.set(false);
      },
      error: () => {
        // json-server returns a 404 for an id that doesn't exist
        this.errorMessage.set('Bill not found.');
        this.isLoading.set(false);
      },
    });
  }

  payBill(): void {
    const current = this.bill();
    if (!current) return;

    this.isPaying.set(true);
    this.billService.payBill(current.id).subscribe({
      next: (updated) => {
        this.bill.set(updated); // the response is the saved bill, now marked paid
        this.successMessage.set('Payment received. Thank you!');
        this.isPaying.set(false);
      },
      error: (err) => {
        console.error('Payment failed:', err);
        this.errorMessage.set('Payment could not be processed. Please try again.');
        this.isPaying.set(false);
      },
    });
  }
}
