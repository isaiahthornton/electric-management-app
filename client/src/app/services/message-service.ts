import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message } from '../interfaces/message';
import { API_URL } from '../utils/api';

@Service()
export class MessageService {
  private http = inject(HttpClient);
  private url = `${API_URL}/messages`;

  sendMessage(message: Omit<Message, 'id'>): Observable<Message> {
    return this.http.post<Message>(this.url, message);
  }

  getAllMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.url}?_sort=sentAt&_order=desc`);
  }

  markRead(id: number): Observable<Message> {
    return this.http.patch<Message>(`${this.url}/${id}`, { status: 'read' });
  }
}
