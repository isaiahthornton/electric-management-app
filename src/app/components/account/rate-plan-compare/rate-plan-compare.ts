import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../../services/auth-service';
import { CustomerService } from '../../../services/customer-service';
import { MeterService } from '../../../services/meter-service';
import { RatePlanService } from '../../../services/rate-plan-service';
import { Customer } from '../../../interfaces/customer';
import { RatePlan } from '../../../interfaces/rate-plan';
import { MeterReading } from '../../../interfaces/meter-reading';
import { PlanEstimate } from '../../../interfaces/plan-estimate';
import { calculateMonthlyUsage } from '../../../utils/usage';

/**
 * Rate plan comparison (/account/rate-plans).
 * Estimates each plan's monthly cost from the customer's real average usage
 * and lets them switch plans.
 */
@Component({
  imports: [CurrencyPipe, DecimalPipe],
  selector: 'app-rate-plan-compare',
  styleUrl: './rate-plan-compare.css',
  templateUrl: './rate-plan-compare.html',
})
export class RatePlanCompare implements OnInit {
  private authService = inject(AuthService);
  private customerService = inject(CustomerService);
  private meterService = inject(MeterService);
  private ratePlanService = inject(RatePlanService);

  protected readonly customer = signal<Customer | null>(null);
  protected readonly plans = signal<RatePlan[]>([]);
  protected readonly readings = signal<MeterReading[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');

  // Switching state
  protected readonly switchingPlanId = signal<number | null>(null); // which button is busy
  protected readonly successMessage = signal('');

  // --- Usage ---
  protected readonly averageKwh = computed(() => {
    const months = calculateMonthlyUsage(this.readings());
    if (months.length === 0) return 0;
    return months.reduce((total, m) => total + m.kwh, 0) / months.length;
  });

  // --- Estimates ---
  // Same formula as a bill: kWh × price + monthly fee. Cheapest first.
  protected readonly estimates = computed<PlanEstimate[]>(() => {
    const avg = this.averageKwh();
    const currentPlanId = this.customer()?.ratePlanId;
    return this.plans()
      .map((plan) => ({
        plan,
        monthlyCost: avg * plan.pricePerKwh + plan.monthlyFee,
        isCurrent: plan.id === currentPlanId,
      }))
      .sort((a, b) => a.monthlyCost - b.monthlyCost);
  });

  protected readonly currentEstimate = computed(() => this.estimates().find((e) => e.isCurrent) ?? null);
  protected readonly cheapestPlanId = computed(() => this.estimates()[0]?.plan.id ?? null);

  ngOnInit(): void {
    const customerId = this.authService.getCurrentUser()?.customerId;
    if (customerId == null) {
      this.errorMessage.set('No customer account is linked to this login.');
      this.isLoading.set(false);
      return;
    }

    forkJoin({
      customer: this.customerService.getCustomerById(customerId),
      plans: this.ratePlanService.getRatePlans(),
      readings: this.meterService.getReadingsByCustomer(customerId),
    }).subscribe({
      next: ({ customer, plans, readings }) => {
        this.customer.set(customer);
        this.plans.set(plans);
        this.readings.set(readings);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Rate plans load failed:', err);
        this.errorMessage.set('Could not load rate plans. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  // How much cheaper (positive) or pricier (negative) a plan is than the current one
  protected savingsVsCurrent(estimate: PlanEstimate): number {
    const current = this.currentEstimate();
    return current ? current.monthlyCost - estimate.monthlyCost : 0;
  }

  switchPlan(plan: RatePlan): void {
    const current = this.customer();
    if (!current) return;

    this.switchingPlanId.set(plan.id);
    this.successMessage.set('');

    this.customerService.updateRatePlan(current.id, plan.id).subscribe({
      next: (updated) => {
        // The new ratePlanId flows into estimates(), which moves the "Current plan" badge
        this.customer.set(updated);
        this.successMessage.set(`You're now on the ${plan.name} plan. It applies from your next bill.`);
        this.switchingPlanId.set(null);
      },
      error: (err) => {
        console.error('Plan switch failed:', err);
        this.errorMessage.set('Could not switch plans. Please try again.');
        this.switchingPlanId.set(null);
      },
    });
  }
}
