import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { RatePlanService } from '../../services/rate-plan-service';
import { RatePlan } from '../../interfaces/rate-plan';

@Component({
  imports: [RouterLink, CurrencyPipe],
  selector: 'app-landing',
  styleUrl: './landing.css',
  templateUrl: './landing.html',
})
export class Landing implements OnInit {
  private ratePlanService = inject(RatePlanService);
  protected readonly ratePlans = signal<RatePlan[]>([]);

  ngOnInit(): void {
    this.ratePlanService.getRatePlans().subscribe({
      next: (plans) => this.ratePlans.set(plans),
      error: (err) => console.error('Error fetching rate plans:', err)
    });
  }
}

