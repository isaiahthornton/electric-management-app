export type MessageTopic = 'billing' | 'outage' | 'service' | 'other';
export type MessageStatus = 'new' | 'read';

export interface Message {
  id: number;
  name: string;
  email: string;
  topic: MessageTopic;
  accountNumber: string | null; // optional on the form, so null when left blank
  message: string;
  sentAt: string;
  status: MessageStatus;
}
