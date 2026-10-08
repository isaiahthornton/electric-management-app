import { MeterReading } from '../interfaces/meter-reading';
import { MonthlyUsage } from '../interfaces/monthly-usage';

export function calculateMonthlyUsage(readings: MeterReading[]): MonthlyUsage[] {
  return readings.slice(1).map((reading, i) => ({
    month: readings[i].readingDate,
    kwh: reading.readingValue - readings[i].readingValue,
  }));
}
