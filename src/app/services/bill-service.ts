import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bill } from '../interfaces/bill';
import { API_URL } from '../utils/api';
import { todayIso } from '../utils/dates';

@Service()
export class BillService {
  private http = inject(HttpClient);
  private url = `${API_URL}/bills`;

  getBillsByCustomer(customerId: number): Observable<Bill[]> {
    return this.http.get<Bill[]>(
      `${this.url}?customerId=${customerId}&_sort=periodStart&_order=desc`,
    );
  }
  getBillById(billId: number): Observable<Bill> {
    return this.http.get<Bill>(`${this.url}/${billId}`);
  }
  payBill(billId: number): Observable<Bill> {
    return this.http.patch<Bill>(`${this.url}/${billId}`, {
      status: 'paid',
      paidDate: todayIso(),
    });
  }
}
