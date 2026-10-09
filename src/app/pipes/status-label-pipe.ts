import { Pipe, PipeTransform } from '@angular/core';

/**
 * Turns status values into readable labels:
 * 'in_progress' → 'In Progress', 'overdue' → 'Overdue'
 */
@Pipe({ name: 'statusLabel' })
export class StatusLabelPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return value
      .split('_') // 'in_progress' → ['in', 'progress']
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // → ['In', 'Progress']
      .join(' '); // → 'In Progress'
  }
}
