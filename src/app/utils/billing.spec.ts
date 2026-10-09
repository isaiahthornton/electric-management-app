import { addDays, buildBill, periodBounds, withOverdueStatus } from './billing';
import { Bill } from '../interfaces/bill';
import { RatePlan } from '../interfaces/rate-plan';

describe('periodBounds', () => {
  it('handles a 30-day month', () => {
    expect(periodBounds('2026-09')).toEqual({ start: '2026-09-01', end: '2026-09-30', nextStart: '2026-10-01' });
  });

  it('handles February in a leap year', () => {
    expect(periodBounds('2028-02').end).toBe('2028-02-29');
  });

  it('rolls December over to January of the next year', () => {
    expect(periodBounds('2026-12').nextStart).toBe('2027-01-01');
  });
});

describe('addDays', () => {
  it('crosses into the next month', () => {
    expect(addDays('2026-09-30', 21)).toBe('2026-10-21');
  });

  it('crosses into the next year', () => {
    expect(addDays('2026-12-25', 10)).toBe('2027-01-04');
  });
});

describe('buildBill', () => {
  const standard: RatePlan = { id: 1, name: 'Standard', pricePerKwh: 0.18, monthlyFee: 20, description: '' };

  it("matches Jane's September bill: 640 kWh x $0.18 + $20", () => {
    const bill = buildBill(1, standard, 10000, 10640, '2026-09');

    expect(bill.kwhUsed).toBe(640);
    expect(bill.energyCharge).toBe(115.2);
    expect(bill.amountDue).toBe(135.2);
    expect(bill.dueDate).toBe('2026-10-21');
    expect(bill.status).toBe('unpaid');
  });
});

describe('withOverdueStatus', () => {
  const bill = { status: 'unpaid', dueDate: '2026-10-21' } as Bill;

  it('marks an unpaid bill overdue the day after it is due', () => {
    expect(withOverdueStatus(bill, '2026-10-22').status).toBe('overdue');
  });

  it('leaves it unpaid on the due date itself', () => {
    expect(withOverdueStatus(bill, '2026-10-21').status).toBe('unpaid');
  });

  it('never changes a paid bill', () => {
    expect(withOverdueStatus({ ...bill, status: 'paid' }, '2030-01-01').status).toBe('paid');
  });

  it('returns a new object instead of changing the original', () => {
    withOverdueStatus(bill, '2026-10-22');
    expect(bill.status).toBe('unpaid');
  });
});
