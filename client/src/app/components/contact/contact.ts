import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MessageService } from '../../services/message-service';
import { AuthService } from '../../services/auth-service';
import { MessageTopic } from '../../interfaces/message';
import { nowIso } from '../../utils/dates';

/**
 * Contact (/contact).
 * Ways to reach Thornton Energy, a message form that lands in the admin inbox, and FAQs.
 */
@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-contact',
  styleUrl: './contact.css',
  templateUrl: './contact.html',
})
export class Contact {
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);

  // Logged-in users don't have to retype their email
  private readonly knownEmail = this.authService.getCurrentUser()?.email ?? '';

  protected readonly topics: { value: MessageTopic; label: string }[] = [
    { value: 'billing', label: 'Billing or payments' },
    { value: 'service', label: 'Start, stop, or move service' },
    { value: 'outage', label: 'A past outage' },
    { value: 'other', label: 'Something else' },
  ];

  protected readonly faqs = [
    {
      q: 'Where do I find my account number?',
      a: 'It is printed at the top of every bill, in the format TE-100001. You also need it to register for online access.',
    },
    {
      q: 'How do I report an outage?',
      a: 'Log in and use the Outages page to report it and follow the repair, or call the 24/7 outage line. Never approach a downed line.',
    },
    {
      q: 'Can I change my rate plan?',
      a: 'Yes. The Rate Plans page in your account estimates what each plan would cost you, and you can switch in one click. The new plan starts on your next bill.',
    },
    {
      q: 'When is my bill due?',
      a: 'Bills are due 21 days after the end of each billing period. Your dashboard always shows the next due date.',
    },
  ];

  protected readonly isSending = signal(false);
  protected readonly sent = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    email: [this.knownEmail, [Validators.required, Validators.email]],
    topic: ['billing' as MessageTopic, Validators.required],
    // Optional, but if it's filled in it must look like a real account number
    accountNumber: ['', Validators.pattern(/^(TE-\d{6})?$/)],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
  });

  send(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    this.isSending.set(true);
    this.errorMessage.set('');

    this.messageService
      .sendMessage({
        ...values,
        accountNumber: values.accountNumber || null, // blank → null, matching the interface
        sentAt: nowIso(),
        status: 'new',
      })
      .subscribe({
        next: () => {
          this.sent.set(true);
          this.isSending.set(false);
          this.form.reset({ topic: 'billing', email: this.knownEmail });
        },
        error: (err) => {
          console.error('Message failed:', err);
          this.errorMessage.set('Your message could not be sent. Please try again or call us.');
          this.isSending.set(false);
        },
      });
  }
}
