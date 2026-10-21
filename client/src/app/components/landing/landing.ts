import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { RatePlanService } from '../../services/rate-plan-service';
import { AuthService } from '../../services/auth-service';
import { RatePlan } from '../../interfaces/rate-plan';

/**
 * Public landing page (/).
 * Hero, company facts, mission and values, rate plans, and an outage call to action.
 */
@Component({
  imports: [RouterLink, CurrencyPipe, NgOptimizedImage],
  selector: 'app-landing',
  styleUrl: './landing.css',
  templateUrl: './landing.html',
})
export class Landing implements OnInit {
  private ratePlanService = inject(RatePlanService);
  private authService = inject(AuthService);

  protected readonly ratePlans = signal<RatePlan[]>([]);
  protected readonly currentUser = toSignal(this.authService.currentUser$, { initialValue: null });

  // --- Buttons change depending on who's logged in ---
  protected readonly accountLink = computed(() =>
    this.currentUser()?.role === 'admin' ? '/admin' : '/account',
  );

  protected readonly outageLink = computed(() => {
    const user = this.currentUser();
    if (!user) return '/login';
    return user.role === 'admin' ? '/admin/outages' : '/account/outages';
  });

  // Logged out: send them to login, then straight on to the outage page
  protected readonly outageQuery = computed(() =>
    this.currentUser() ? null : { returnUrl: '/account/outages' },
  );

  // --- Static content, kept in the class so the template stays a simple @for ---
  protected readonly facts = [
    { value: '48,000', label: 'homes and businesses served' },
    { value: '1,200 mi', label: 'of power lines maintained' },
    { value: '3.4 hrs', label: 'average outage repair time' },
  ];

  protected readonly values = [
    {
      title: 'Reliable power',
      text: 'Crews on call around the clock, and every outage tracked from the first report to the final fix.',
    },
    {
      title: 'Safety first',
      text: 'Every job starts with a safety check, for our crews and for the neighborhoods they work in.',
    },
    {
      title: 'Cleaner energy',
      text: 'Our Green Energy plan runs on 100% renewable sources, and we are adding solar to our own substations.',
    },
  ];

  ngOnInit(): void {
    this.ratePlanService.getRatePlans().subscribe({
      next: (plans) => this.ratePlans.set(plans),
      error: (err) => console.error('Error fetching rate plans:', err),
    });
  }
}
