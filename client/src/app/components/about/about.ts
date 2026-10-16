import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

/**
 * About (/about).
 * Company story, service area, leadership, and a credit for who built this demo.
 */
@Component({
  imports: [NgOptimizedImage],
  selector: 'app-about',
  styleUrl: './about.css',
  templateUrl: './about.html',
})
export class About {
  // A real sequence, so the years carry the order
  protected readonly timeline = [
    { year: '1952', text: 'Founded as East Windsor Light & Power, serving 900 homes along Route 130.' },
    { year: '1987', text: 'Renamed Thornton Energy after merging with three neighboring municipal utilities.' },
    { year: '2014', text: 'Finished replacing every customer meter with a smart meter read monthly.' },
    { year: '2024', text: 'Launched the Green Energy plan, powered entirely by renewable sources.' },
    { year: '2026', text: 'Moved billing, usage, and outage reporting online with this customer portal.' },
  ];

  protected readonly towns = ['East Windsor', 'Hightstown', 'Cranbury', 'Robbinsville', 'Plainsboro', 'Millstone'];

  // Fictional leadership team. Initials instead of photos so no real person
  // is presented as working for a company that doesn't exist.
  protected readonly leaders = [
    {
      name: 'Margaret Thornton',
      role: 'Chief Executive Officer',
      bio: 'Joined as a field engineer in 1998 and has led the company since 2019.',
    },
    {
      name: 'David Okafor',
      role: 'VP, Grid Operations',
      bio: 'Runs the crews, substations, and the 24/7 outage response team.',
    },
    {
      name: 'Priya Raman',
      role: 'Director, Customer Experience',
      bio: 'Leads customer care and the move to online billing and self-service.',
    },
  ];

  protected initials(name: string): string {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('');
  }
}
