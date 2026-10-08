import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer } from '../interfaces/customer';
import { API_URL } from '../utils/api';


@Service()
export class CustomerService {
  private http = inject(HttpClient);
  private url = `${API_URL}/customers`;

  getCustomerById(customerId: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.url}/${customerId}`);
  }
}
