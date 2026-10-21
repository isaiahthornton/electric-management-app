import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { AdminInsightService } from '../../../services/admin-insight-service';
import { AuditEntry } from '../../../interfaces/admin-insight';

/**
 * Admin activity page (/admin/activity).
 * The latest status changes, recorded by database triggers: what changed, old → new, and who did it.
 */
@Component({
  imports: [DatePipe],
  selector: 'app-admin-activity',
  templateUrl: './admin-activity.html',
})
export class AdminActivity implements OnInit {
  private insightService = inject(AdminInsightService);

  protected readonly entries = signal<AuditEntry[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');

  ngOnInit(): void {
    this.insightService.getActivity(50).subscribe({
      next: (entries) => {
        this.entries.set(entries);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Activity load failed:', err);
        this.errorMessage.set('Could not load recent activity. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  // "Bills" + 12 → "Bill #12"
  protected recordLabel(entry: AuditEntry): string {
    const names: Record<string, string> = { Bills: 'Bill', Customers: 'Customer', Outages: 'Outage' };
    return `${names[entry.tableName] ?? entry.tableName} #${entry.recordId}`;
  }

  // "RatePlanId" → "rate plan", "Status" → "status"
  protected columnLabel(entry: AuditEntry): string {
    return entry.columnName === 'RatePlanId' ? 'rate plan' : entry.columnName.toLowerCase();
  }

  // "InProgress" → "In Progress"; rate plan ids become "plan 3"
  protected valueLabel(entry: AuditEntry, value: string | null): string {
    if (value === null) return '—';
    if (entry.columnName === 'RatePlanId') return `plan ${value}`;
    return value.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}
