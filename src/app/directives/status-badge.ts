import { Directive, input } from '@angular/core';

/**
 * Turns an element into a colored status badge.
 * Usage: <span [appStatusBadge]="bill.status">{{ bill.status | statusLabel }}</span>
 * The color comes from styles.css, matched on the data-status attribute.
 */
@Directive({
  selector: '[appStatusBadge]',
  host: {
    class: 'status-badge',
    '[attr.data-status]': 'appStatusBadge()',
  },
})
export class StatusBadge {
  readonly appStatusBadge = input.required<string>();
}
