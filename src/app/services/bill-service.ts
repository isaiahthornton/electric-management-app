import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bill } from '../interfaces/bill';
import { API_URL } from '../utils/api';

@Service()
export class BillService {
  private http = inject(HttpClient);
  private url = `${API_URL}/bills`;

  getBillsByCustomer(customerId: number): Observable<Bill[]> {
    return this.http.get<Bill[]>(
      `${this.url}?customerId=${customerId}&_sort=periodStart&_order=desc`,
    );
  }
}
