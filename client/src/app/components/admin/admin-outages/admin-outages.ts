import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { forkJoin } from 'rxjs';

import { OutageService } from '../../../services/outage-service';
import { CustomerService } from '../../../services/customer-service';
import { Outage, OutageStatus } from '../../../interfaces/outage';
import { Customer } from '../../../interfaces/customer';

interface QueueColumn {
  status: OutageStatus;
  title: string;
  outages: Outage[];
}

/**
 * Outage queue (/admin/outages).
 * Crews' view of every outage, grouped by where it is in the repair process.
 */
@Component({
  imports: [DatePipe, DecimalPipe],
  selector: 'app-admin-outages',
  styleUrl: './admin-outages.css',
  templateUrl: './admin-outages.html',
})
export class AdminOutages implements OnInit {
  private outageService = inject(OutageService);
  private customerService = inject(CustomerService);

  protected readonly outages = signal<Outage[]>([]);
  protected readonly customers = signal<Customer[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly savingId = signal<number | null>(null);

  // id → "First Last", so each card can show who reported it
  private readonly customerNames = computed(
    () => new Map(this.customers().map((c) => [c.id, `${c.firstName} ${c.lastName}`])),
  );

  protected readonly columns = computed<QueueColumn[]>(() => {
    const all = this.outages();
    return [
      { status: 'reported', title: 'Reported', outages: all.filter((o) => o.status === 'reported') },
      { status: 'in_progress', title: 'In Progress', outages: all.filter((o) => o.status === 'in_progress') },
      { status: 'resolved', title: 'Resolved', outages: all.filter((o) => o.status === 'resolved') },
    ];
  });

  ngOnInit(): void {
    forkJoin({
      outages: this.outageService.getAllOutages(),
      customers: this.customerService.getAllCustomers(),
    }).subscribe({
      next: ({ outages, customers }) => {
        this.outages.set(outages);
        this.customers.set(customers);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Outage queue load failed:', err);
        this.errorMessage.set('Could not load outages. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  protected customerName(customerId: number): string {
    return this.customerNames().get(customerId) ?? 'Unknown customer';
  }

  // How long a resolved outage took to fix
  protected hoursToResolve(outage: Outage): number | null {
    if (!outage.timeResolved) return null;
    const ms = new Date(outage.timeResolved).getTime() - new Date(outage.timeReported).getTime();
    return ms / (1000 * 60 * 60);
  }

  setStatus(outage: Outage, status: OutageStatus): void {
    this.savingId.set(outage.id);
    this.outageService.updateOutageStatus(outage.id, status).subscribe({
      next: (updated) => {
        // Replacing it in the list moves the card to its new column automatically
        this.outages.update((list) => list.map((o) => (o.id === updated.id ? updated : o)));
        this.savingId.set(null);
      },
      error: (err) => {
        console.error('Outage update failed:', err);
        this.errorMessage.set('Could not update the outage. Please try again.');
        this.savingId.set(null);
      },
    });
  }
}
