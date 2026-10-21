import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { OutageService } from '../../../services/outage-service';
import { OutageMapItem } from '../../../interfaces/outage-map';
import { MapMarker, MapView } from '../../map-view/map-view';
import { StatusLabelPipe } from '../../../pipes/status-label-pipe';

/**
 * Admin outage map (/admin/outage-map).
 * Every outage as a colored dot at the customer's service location: red = reported, amber = in progress, green = resolved.
 */
@Component({
  imports: [MapView],
  selector: 'app-admin-outage-map',
  styleUrl: './admin-outage-map.css',
  templateUrl: './admin-outage-map.html',
})
export class AdminOutageMap implements OnInit {
  private outageService = inject(OutageService);
  private statusLabel = new StatusLabelPipe();

  protected readonly outages = signal<OutageMapItem[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');

  // One dot per outage, with the popup text (customer, address, time reported, status)
  protected readonly markers = computed<MapMarker[]>(() =>
    this.outages().map((o) => ({
      lat: o.latitude,
      lng: o.longitude,
      status: o.status,
      title: o.customerName,
      lines: [
        o.address,
        `Reported ${new Date(o.timeReported).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`,
        `Status: ${this.statusLabel.transform(o.status)}`,
        o.description,
      ],
    })),
  );

  protected readonly openCount = computed(() => this.outages().filter((o) => o.status !== 'resolved').length);

  ngOnInit(): void {
    this.outageService.getOutageMap().subscribe({
      next: (outages) => {
        this.outages.set(outages);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Outage map load failed:', err);
        this.errorMessage.set('Could not load the outage map. Please try again.');
        this.isLoading.set(false);
      },
    });
  }
}
