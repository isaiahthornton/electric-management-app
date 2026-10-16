import { RatePlan } from './rate-plan';

// A rate plan plus what it would cost this customer per month (calculated, not stored)
export interface PlanEstimate {
  plan: RatePlan;
  monthlyCost: number;
  isCurrent: boolean;
}
