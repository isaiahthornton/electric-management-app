import { calculateMonthlyUsage } from './usage';
import { MeterReading } from '../interfaces/meter-reading';

describe('calculateMonthlyUsage', () => {
  const reading = (readingDate: string, readingValue: number): MeterReading => ({
    id: 0, meterId: 1, readingDate, readingValue,
  });

  it('subtracts each reading from the next one', () => {
    const usage = calculateMonthlyUsage([
      reading('2026-08-01', 10000),
      reading('2026-09-01', 10580),
      reading('2026-10-01', 11220),
    ]);

    expect(usage).toEqual([
      { month: '2026-08-01', kwh: 580 },
      { month: '2026-09-01', kwh: 640 },
    ]);
  });

  it('returns nothing for fewer than two readings', () => {
    expect(calculateMonthlyUsage([reading('2026-08-01', 10000)])).toEqual([]);
    expect(calculateMonthlyUsage([])).toEqual([]);
  });
});
