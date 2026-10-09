import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../../services/auth-service';
import { CustomerService } from '../../../services/customer-service';
import { OutageService } from '../../../services/outage-service';
import { Outage } from '../../../interfaces/outage';
import { StatusLabelPipe } from '../../../pipes/status-label-pipe';
import { nowIso } from '../../../utils/dates';

/**
 * Outages (/account/outages).
 * Customers report a new outage and see the status of past reports.
 */
@Component({
  imports: [DatePipe, ReactiveFormsModule, StatusLabelPipe],
  selector: 'app-customer-outages',
  styleUrl: './customer-outages.css',
  templateUrl: './customer-outages.html',
})
export class CustomerOutages implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private customerService = inject(CustomerService);
  private outageService = inject(OutageService);

  private customerId: number | null = null;
  private serviceAddress = ''; // kept so the form can be reset back to it

  protected readonly outages = signal<Outage[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');

  // Form state
  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal('');
  protected readonly successMessage = signal('');

  protected readonly form = this.fb.nonNullable.group({
    address: ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(300)]],
  });

  ngOnInit(): void {
    this.customerId = this.authService.getCurrentUser()?.customerId ?? null;
    if (this.customerId == null) {
      this.errorMessage.set('No customer account is linked to this login.');
      this.isLoading.set(false);
      return;
    }

    // Need the customer (for their address) and their past outages
    forkJoin({
      customer: this.customerService.getCustomerById(this.customerId),
      outages: this.outageService.getOutagesByCustomer(this.customerId),
    }).subscribe({
      next: ({ customer, outages }) => {
        this.serviceAddress = customer.serviceAddress;
        this.form.patchValue({ address: customer.serviceAddress }); // pre-fill, but still editable
        this.outages.set(outages);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Outages load failed:', err);
        this.errorMessage.set('Could not load your outages. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  reportOutage(): void {
    if (this.form.invalid || this.customerId == null) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set('');
    this.successMessage.set('');

    const { address, description } = this.form.getRawValue();

    // Every new report starts as 'reported'; an admin moves it along from there
    this.outageService
      .reportOutage({
        customerId: this.customerId,
        address,
        description,
        timeReported: nowIso(),
        timeResolved: null,
        status: 'reported',
      })
      .subscribe({
        next: (created) => {
          // Add the new outage to the top of the list without reloading everything
          this.outages.update((list) => [created, ...list]);
          this.form.reset({ address: this.serviceAddress, description: '' });
          this.successMessage.set('Outage reported. Our crews have been notified.');
          this.isSubmitting.set(false);
        },
        error: (err) => {
          console.error('Report failed:', err);
          this.submitError.set('Could not submit your report. Please try again.');
          this.isSubmitting.set(false);
        },
      });
  }
}
