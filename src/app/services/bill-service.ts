import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Bill } from '../interfaces/bill';
import { API_URL } from '../utils/api';
import { todayIso } from '../utils/dates';
import { withOverdueStatus } from '../utils/billing';

@Service()
export class BillService {
  private http = inject(HttpClient);
  private url = `${API_URL}/bills`;

  getBillsByCustomer(customerId: number): Observable<Bill[]> {
    return this.http
      .get<Bill[]>(`${this.url}?customerId=${customerId}&_sort=periodStart&_order=desc`)
      .pipe(map((bills) => bills.map((b) => withOverdueStatus(b))));
  }
  getBillById(billId: number): Observable<Bill> {
    return this.http.get<Bill>(`${this.url}/${billId}`).pipe(map((b) => withOverdueStatus(b)));
  }
  payBill(billId: number): Observable<Bill> {
    return this.http.patch<Bill>(`${this.url}/${billId}`, {
      status: 'paid',
      paidDate: todayIso(),
    });
  }
  getAllBills(): Observable<Bill[]> {
    return this.http
      .get<Bill[]>(`${this.url}?_sort=periodStart&_order=desc`)
      .pipe(map((bills) => bills.map((b) => withOverdueStatus(b))));
  }
  createBill(bill: Omit<Bill, 'id'>): Observable<Bill> {
    return this.http.post<Bill>(this.url, bill);
  }
}
