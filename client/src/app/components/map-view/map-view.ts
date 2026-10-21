import { AfterViewInit, Component, ElementRef, OnDestroy, effect, input, viewChild } from '@angular/core';
import * as L from 'leaflet';

// One dot on the map. "status" picks the color; "lines" are the text rows in the popup.
export interface MapMarker {
  lat: number;
  lng: number;
  status: 'reported' | 'in_progress' | 'resolved' | 'none';
  title: string;
  lines: string[];
}

// Same colors as the legend on the admin page
export const MARKER_COLORS: Record<MapMarker['status'], string> = {
  reported: '#b42318', // red
  in_progress: '#f2b705', // amber
  resolved: '#1f7a4d', // green
  none: '#2f6fb3', // blue: a location with no outage
};

/**
 * A small OpenStreetMap map (Leaflet) with one colored dot per marker.
 * Dots are circleMarkers (drawn by Leaflet itself), so there are no marker image files to load.
 * Popup text is added as plain text, never as HTML, because outage descriptions are typed by customers.
 */
@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.html',
  styleUrl: './map-view.css',
})
export class MapView implements AfterViewInit, OnDestroy {
  readonly markers = input.required<MapMarker[]>();
  readonly height = input('420px');

  private readonly mapElement = viewChild.required<ElementRef<HTMLDivElement>>('map');
  private map?: L.Map;
  private readonly markerLayer = L.layerGroup();

  constructor() {
    // Redraw whenever the markers change (the map itself only exists after the view is ready)
    effect(() => {
      const markers = this.markers();
      if (this.map) this.drawMarkers(markers);
    });
  }

  ngAfterViewInit(): void {
    // Start centered on East Windsor, NJ; drawMarkers zooms to fit the dots
    this.map = L.map(this.mapElement().nativeElement).setView([40.27, -74.53], 14);

    // The attribution text is required by OpenStreetMap's tile usage policy
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.markerLayer.addTo(this.map);
    this.drawMarkers(this.markers());
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private drawMarkers(markers: MapMarker[]): void {
    this.markerLayer.clearLayers();

    for (const marker of markers) {
      L.circleMarker([marker.lat, marker.lng], {
        radius: 10,
        color: '#ffffff', // white outline so dots stand out on the map
        weight: 2,
        fillColor: MARKER_COLORS[marker.status],
        fillOpacity: 0.9,
      })
        .bindPopup(this.buildPopup(marker))
        .addTo(this.markerLayer);
    }

    // Zoom so every dot is visible (but not closer than street level)
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng] as [number, number]));
      this.map?.fitBounds(bounds.pad(0.3), { maxZoom: 16 });
    }
  }

  // Built with textContent (not innerHTML) so typed text can never run as HTML
  private buildPopup(marker: MapMarker): HTMLElement {
    const box = document.createElement('div');

    const title = document.createElement('strong');
    title.textContent = marker.title;
    box.appendChild(title);

    for (const line of marker.lines) {
      const row = document.createElement('div');
      row.textContent = line;
      box.appendChild(row);
    }
    return box;
  }
}
