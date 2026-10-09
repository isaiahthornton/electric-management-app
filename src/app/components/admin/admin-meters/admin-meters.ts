import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { MeterService } from '../../../services/meter-service';
import { CustomerService } from '../../../services/customer-service';
import { Meter, MeterStatus } from '../../../interfaces/meter';
import { MeterReading } from '../../../interfaces/meter-reading';
import { Customer } from '../../../interfaces/customer';
import { todayIso } from '../../../utils/dates';

/**
 * Meter management (/admin/meters).
 * See every meter's latest reading, change meter status, and enter new readings.
 */
@Component({
  imports: [DatePipe, DecimalPipe, TitleCasePipe, ReactiveFormsModule],
  selector: 'app-admin-meters',
  styleUrl: './admin-meters.css',
  templateUrl: './admin-meters.html',
})
export class AdminMeters implements OnInit {
  private fb = inject(FormBuilder);
  private meterService = inject(MeterService);
  private customerService = inject(CustomerService);

  protected readonly meters = signal<Meter[]>([]);
  protected readonly readings = signal<MeterReading[]>([]);
  protected readonly customers = signal<Customer[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');

  protected readonly statuses: MeterStatus[] = ['active', 'inactive', 'removed'];
  protected readonly savingId = signal<number | null>(null);

  // Reading form state
  protected readonly readingError = signal('');
  protected readonly readingMessage = signal('');

  private readonly customerNames = computed(
    () => new Map(this.customers().map((c) => [c.id, `${c.firstName} ${c.lastName}`])),
  );

  // meter id → its most recent reading
  protected readonly latestReadings = computed(() => {
    const latest = new Map<number, MeterReading>();
    for (const r of this.readings()) {
      const current = latest.get(r.meterId);
      // 'YYYY-MM-DD' strings compare correctly as text
      if (!current || r.readingDate > current.readingDate) latest.set(r.meterId, r);
    }
    return latest;
  });

  protected readonly readingForm = this.fb.nonNullable.group({
    meterId: [0, Validators.min(1)], // 0 = nothing picked yet
    readingDate: [todayIso(), Validators.required],
    readingValue: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    forkJoin({
      meters: this.meterService.getAllMeters(),
      readings: this.meterService.getAllReadings(),
      customers: this.customerService.getAllCustomers(),
    }).subscribe({
      next: ({ meters, readings, customers }) => {
        this.meters.set(meters);
        this.readings.set(readings);
        this.customers.set(customers);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Meters load failed:', err);
        this.errorMessage.set('Could not load meters. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  protected customerName(customerId: number): string {
    return this.customerNames().get(customerId) ?? 'Unassigned';
  }

  changeStatus(meter: Meter, event: Event): void {
    const status = (event.target as HTMLSelectElement).value as MeterStatus;
    this.savingId.set(meter.id);
    this.meterService.updateMeterStatus(meter.id, status).subscribe({
      next: (updated) => {
        this.meters.update((list) => list.map((m) => (m.id === updated.id ? updated : m)));
        this.savingId.set(null);
      },
      error: (err) => {
        console.error('Meter update failed:', err);
        this.errorMessage.set('Could not update the meter. Please try again.');
        this.savingId.set(null);
      },
    });
  }

  addReading(): void {
    this.readingError.set('');
    this.readingMessage.set('');

    if (this.readingForm.invalid) {
      this.readingForm.markAllAsTouched();
      return;
    }

    const { meterId, readingDate, readingValue } = this.readingForm.getRawValue();
    const latest = this.latestReadings().get(meterId);

    // Meters only count up, and readings happen in order
    if (latest && readingDate <= latest.readingDate) {
      this.readingError.set(`Reading date must be after the last reading (${latest.readingDate}).`);
      return;
    }
    if (latest && readingValue < latest.readingValue) {
      this.readingError.set(`Meters only count up. The last reading was ${latest.readingValue} kWh.`);
      return;
    }

    this.meterService.addReading({ meterId, readingDate, readingValue }).subscribe({
      next: (created) => {
        this.readings.update((list) => [...list, created]);
        this.readingMessage.set('Reading saved.');
        this.readingForm.patchValue({ readingValue: 0 });
      },
      error: (err) => {
        console.error('Add reading failed:', err);
        this.readingError.set('Could not save the reading. Please try again.');
      },
    });
  }
}
