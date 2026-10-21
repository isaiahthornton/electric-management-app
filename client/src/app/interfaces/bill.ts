export type BillStatus = 'paid' | 'unpaid' | 'overdue';

export interface Bill {
  id:number;
  customerId:number;
  periodStart:string;
  periodEnd:string;
  dueDate:string;
  kwhUsed:number;
  amountDue:number;
  status:BillStatus;
  energyCharge:number;
  serviceCharge:number;
  paidDate:string | null;
}
