import { OutageStatus } from './outage';

// One row of GET /api/outages/map (admin only): an outage plus its customer name and location
export interface OutageMapItem {
  outageId: number;
  customerId: number;
  customerName: string;
  address: string;
  description: string;
  timeReported: string;
  timeResolved: string | null;
  status: OutageStatus;
  latitude: number;
  longitude: number;
}
