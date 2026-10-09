import { Bill } from '../interfaces/bill';
import { RatePlan } from '../interfaces/rate-plan';
import { todayIso } from './dates';

// Money is rounded to cents at each step, like a real bill
const roundToCents = (n: number) => Math.round(n * 100) / 100;

// 'YYYY-MM' → first day, last day, and first day of the next month
export function periodBounds(month: string): { start: string; end: string; nextStart: string } {
  const [year, mon] = month.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year, mon, 0)).getUTCDate(); // day 0 of next month = last day of this one
  const next = mon === 12 ? `${year + 1}-01` : `${year}-${String(mon + 1).padStart(2, '0')}`;
  return {
    start: `${month}-01`,
    end: `${month}-${String(lastDay).padStart(2, '0')}`,
    nextStart: `${next}-01`,
  };
}

// Adds days to a 'YYYY-MM-DD' date. Uses UTC so the timezone can't shift the result.
export function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// One customer's bill for a month: usage × rate + monthly fee, due 21 days after the period ends
export function buildBill(
  customerId: number,
  plan: RatePlan,
  startReading: number,
  endReading: number,
  month: string,
): Omit<Bill, 'id'> {
  const { start, end } = periodBounds(month);
  const kwhUsed = endReading - startReading;
  const energyCharge = roundToCents(kwhUsed * plan.pricePerKwh);

  return {
    customerId,
    periodStart: start,
    periodEnd: end,
    kwhUsed,
    energyCharge,
    serviceCharge: plan.monthlyFee,
    amountDue: roundToCents(energyCharge + plan.monthlyFee),
    dueDate: addDays(end, 21),
    status: 'unpaid',
    paidDate: null,
  };
}

// An unpaid bill whose due date has passed is overdue. Applied when bills load,
// so "overdue" is always current instead of depending on what's saved in db.json.
export function withOverdueStatus(bill: Bill, today: string = todayIso()): Bill {
  return bill.status === 'unpaid' && bill.dueDate < today ? { ...bill, status: 'overdue' } : bill;
}
