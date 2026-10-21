export type AccountStatus = 'active' | 'inactive' | 'suspended' | 'closed';

export interface Customer {
  id:number;
  accountNumber:string;
  firstName:string;
  lastName:string;
  phone:string;
  email: string;
  serviceAddress:string;
  ratePlanId:number;
  status: AccountStatus;
  latitude: number | null; // service location for the outage map
  longitude: number | null;
}
