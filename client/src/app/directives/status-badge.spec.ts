import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { StatusBadge } from './status-badge';

// A tiny test-only component, because a directive needs an element to sit on
@Component({
  imports: [StatusBadge],
  template: `<span [appStatusBadge]="status()">badge</span>`,
})
class HostComponent {
  status = signal('unpaid');
}

describe('StatusBadge', () => {
  it('adds the status-badge class and data-status attribute', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const span: HTMLElement = fixture.nativeElement.querySelector('span');

    expect(span.classList).toContain('status-badge');
    expect(span.getAttribute('data-status')).toBe('unpaid');
  });

  it('updates data-status when the status changes', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    fixture.componentInstance.status.set('paid');
    fixture.detectChanges();

    const span: HTMLElement = fixture.nativeElement.querySelector('span');
    expect(span.getAttribute('data-status')).toBe('paid');
  });
});
