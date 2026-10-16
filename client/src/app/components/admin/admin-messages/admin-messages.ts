import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';

import { MessageService } from '../../../services/message-service';
import { Message } from '../../../interfaces/message';

/**
 * Admin inbox (/admin/messages).
 * Messages sent from the public Contact page, newest first.
 */
@Component({
  imports: [DatePipe, TitleCasePipe],
  selector: 'app-admin-messages',
  styleUrl: './admin-messages.css',
  templateUrl: './admin-messages.html',
})
export class AdminMessages implements OnInit {
  private messageService = inject(MessageService);

  protected readonly messages = signal<Message[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');

  protected readonly unreadCount = computed(() => this.messages().filter((m) => m.status === 'new').length);

  ngOnInit(): void {
    this.messageService.getAllMessages().subscribe({
      next: (messages) => {
        this.messages.set(messages);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Inbox load failed:', err);
        this.errorMessage.set('Could not load messages. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  markRead(message: Message): void {
    this.messageService.markRead(message.id).subscribe({
      next: (updated) =>
        this.messages.update((list) => list.map((m) => (m.id === updated.id ? updated : m))),
      error: (err) => console.error('Mark read failed:', err),
    });
  }
}
