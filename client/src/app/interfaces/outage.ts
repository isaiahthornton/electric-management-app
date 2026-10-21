export type OutageStatus = 'reported' | 'in_progress' | 'resolved';

export interface Outage {
  id: number;
  customerId: number;
  address: string;
  description: string;
  timeReported: string;
  timeResolved: string | null;
  status: OutageStatus;
}
