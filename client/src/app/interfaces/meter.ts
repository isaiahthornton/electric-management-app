export type MeterStatus = 'active' | 'inactive' | 'removed';

export interface Meter {
  id: number;
  customerId: number;
  meterNumber: string;
  installationDate: string;
  status: MeterStatus;
}
