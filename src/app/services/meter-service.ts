import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Meter } from '../interfaces/meter';
import { API_URL } from '../utils/api';
import { MeterReading } from '../interfaces/meter-reading';

@Service()
export class MeterService {
  private http = inject(HttpClient);
  private metersUrl = `${API_URL}/meters`;
  private readingsUrl = `${API_URL}/meterReadings`;


  getMetersByCustomer(customerId: number): Observable<Meter[]> {
    return this.http.get<Meter[]>(
      `${this.metersUrl}?customerId=${customerId}&_sort=installationDate&_order=desc`,
    );
  }
  getReadingsByMeter(meterId: number): Observable<MeterReading[]> {
    return this.http.get<MeterReading[]>(
      `${this.readingsUrl}?meterId=${meterId}&_sort=readingDate&_order=asc`,
    );
  }
}
