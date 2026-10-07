import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RatePlanService } from './services/rate-plan-service';
import { RatePlan } from './interfaces/rate-plan';
import { CurrencyPipe } from '@angular/common';

@Component({
  imports: [RouterOutlet, CurrencyPipe],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private ratePlanService = inject(RatePlanService);
  protected readonly ratePlans = signal<RatePlan[]>([]);

  ngOnInit(): void {
    this.ratePlanService.getRatePlans().subscribe({
      next: (plans) => this.ratePlans.set(plans),
      error: (err) => console.error('Error fetching rate plans:', err)
    });
  }
  protected readonly title = signal('Thornton Energy Inc.');

  protected readonly intro = signal(`Thornton Energy Inc. is a leading provider of sustainable energy solutions, dedicated to delivering innovative and efficient energy systems for residential, commercial, and industrial applications. Our mission is to empower communities and businesses with reliable, clean, and cost-effective energy alternatives that contribute to a greener future.`);
}
