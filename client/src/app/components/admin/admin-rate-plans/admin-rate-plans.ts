import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { RatePlanService } from '../../../services/rate-plan-service';
import { CustomerService } from '../../../services/customer-service';
import { RatePlan } from '../../../interfaces/rate-plan';
import { Customer } from '../../../interfaces/customer';

/**
 * Rate plan management (/admin/rate-plans).
 * Create, edit, and delete plans. Plans with customers on them can't be deleted.
 */
@Component({
  imports: [CurrencyPipe, ReactiveFormsModule],
  selector: 'app-admin-rate-plans',
  styleUrl: './admin-rate-plans.css',
  templateUrl: './admin-rate-plans.html',
})
export class AdminRatePlans implements OnInit {
  private fb = inject(FormBuilder);
  private ratePlanService = inject(RatePlanService);
  private customerService = inject(CustomerService);

  protected readonly plans = signal<RatePlan[]>([]);
  protected readonly customers = signal<Customer[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');

  protected readonly editingId = signal<number | null>(null); // null = adding a new plan
  protected readonly confirmDeleteId = signal<number | null>(null); // two-click delete
  protected readonly isSaving = signal(false);

  // plan id → how many customers are on it
  protected readonly customerCounts = computed(() => {
    const counts = new Map<number, number>();
    for (const c of this.customers()) {
      counts.set(c.ratePlanId, (counts.get(c.ratePlanId) ?? 0) + 1);
    }
    return counts;
  });

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(40)]],
    pricePerKwh: [0, [Validators.required, Validators.min(0.01), Validators.max(1)]],
    monthlyFee: [0, [Validators.required, Validators.min(0)]],
    description: ['', [Validators.required, Validators.maxLength(120)]],
  });

  ngOnInit(): void {
    forkJoin({
      plans: this.ratePlanService.getRatePlans(),
      customers: this.customerService.getAllCustomers(),
    }).subscribe({
      next: ({ plans, customers }) => {
        this.plans.set(plans);
        this.customers.set(customers);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Rate plans load failed:', err);
        this.errorMessage.set('Could not load rate plans. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  protected customerCount(planId: number): number {
    return this.customerCounts().get(planId) ?? 0;
  }

  startEdit(plan: RatePlan): void {
    this.editingId.set(plan.id);
    this.successMessage.set('');
    // setValue needs every field; patchValue would allow some
    this.form.setValue({
      name: plan.name,
      pricePerKwh: plan.pricePerKwh,
      monthlyFee: plan.monthlyFee,
      description: plan.description,
    });
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.form.reset(); // nonNullable: back to '' and 0, not null
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    const id = this.editingId();
    this.isSaving.set(true);

    // Same form, two possible requests
    const request = id === null
      ? this.ratePlanService.createRatePlan(values)
      : this.ratePlanService.updateRatePlan({ id, ...values });

    request.subscribe({
      next: (saved) => {
        this.plans.update((list) =>
          id === null ? [...list, saved] : list.map((p) => (p.id === saved.id ? saved : p)),
        );
        this.successMessage.set(id === null ? `Added ${saved.name}.` : `Updated ${saved.name}.`);
        this.cancelEdit();
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Save failed:', err);
        this.errorMessage.set('Could not save the plan. Please try again.');
        this.isSaving.set(false);
      },
    });
  }

  deletePlan(plan: RatePlan): void {
    this.ratePlanService.deleteRatePlan(plan.id).subscribe({
      next: () => {
        this.plans.update((list) => list.filter((p) => p.id !== plan.id));
        this.successMessage.set(`Deleted ${plan.name}.`);
        this.confirmDeleteId.set(null);
      },
      error: (err) => {
        console.error('Delete failed:', err);
        this.errorMessage.set('Could not delete the plan. Please try again.');
      },
    });
  }
}
