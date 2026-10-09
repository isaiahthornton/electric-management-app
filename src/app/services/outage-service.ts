import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Outage, OutageStatus } from '../interfaces/outage';
import { API_URL } from '../utils/api';
import { nowIso } from '../utils/dates';

@Service()
export class OutageService {
  private http = inject(HttpClient);
  private url = `${API_URL}/outages`;

  getOutagesByCustomer(customerId: number): Observable<Outage[]> {
    return this.http.get<Outage[]>(
      `${this.url}?customerId=${customerId}&_sort=timeReported&_order=desc`,
    );
  }
  // POST creates a new record; json-server assigns the id and returns the saved outage
  reportOutage(outage: Omit<Outage, 'id'>): Observable<Outage> {
    return this.http.post<Outage>(this.url, outage);
  }
  getAllOutages(): Observable<Outage[]> {
  return this.http.get<Outage[]>(`${this.url}?_sort=timeReported&_order=desc`);
  }
  // Resolving stamps the time; moving back out of 'resolved' clears it,
  // so status and timeResolved never disagree
  updateOutageStatus(outageId: number, status: OutageStatus): Observable<Outage> {
    return this.http.patch<Outage>(`${this.url}/${outageId}`, {
      status,
      timeResolved: status === 'resolved' ? nowIso() : null,
    });
  }
}
