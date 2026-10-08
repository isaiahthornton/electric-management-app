import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Outage } from '../interfaces/outage';
import { API_URL } from '../utils/api';

@Service()
export class OutageService {
  private http = inject(HttpClient);
  private url = `${API_URL}/outages`;

  getOutagesByCustomer(customerId: number): Observable<Outage[]> {
    return this.http.get<Outage[]>(
      `${this.url}?customerId=${customerId}&_sort=timeReported&_order=desc`,
    );
  }
}
