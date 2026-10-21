import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap } from 'rxjs';
import { Meter, MeterStatus } from '../interfaces/meter';
import { API_URL } from '../utils/api';
import { MeterReading } from '../interfaces/meter-reading';

@Service()
export class MeterService {
  private http = inject(HttpClient);
  private metersUrl = `${API_URL}/meters`;
  private readingsUrl = `${API_URL}/meterReadings`;


  getMetersByCustomer(customerId: number): Observable<Meter[]> {
    return this.http.get<Meter[]>(`${this.metersUrl}?customerId=${customerId}`);
  }
  getReadingsByMeter(meterId: number): Observable<MeterReading[]> {
    return this.http.get<MeterReading[]>(`${this.readingsUrl}?meterId=${meterId}`);
  }
  getReadingsByCustomer(customerId: number): Observable<MeterReading[]> {
    return this.getMetersByCustomer(customerId).pipe(
      switchMap((meters) => (meters.length > 0 ? this.getReadingsByMeter(meters[0].id) : of([]))),
    );
  }
  getAllMeters(): Observable<Meter[]> {
    return this.http.get<Meter[]>(this.metersUrl);
  }
  getAllReadings(): Observable<MeterReading[]> {
    return this.http.get<MeterReading[]>(`${this.readingsUrl}`);
  }
  updateMeterStatus(meterId: number, status: MeterStatus): Observable<Meter> {
    return this.http.patch<Meter>(`${this.metersUrl}/${meterId}`, { status });
  }
  addReading(reading: Omit<MeterReading, 'id'>): Observable<MeterReading> {
    return this.http.post<MeterReading>(this.readingsUrl, reading);
  }
}
