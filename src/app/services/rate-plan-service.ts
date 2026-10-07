import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RatePlan } from '../interfaces/rate-plan';
import { API_URL } from '../utils/api';

@Service()
export class RatePlanService {
  private http = inject(HttpClient);
  private url = `${API_URL}/ratePlans`;

  getRatePlans(): Observable<RatePlan[]> {
    return this.http.get<RatePlan[]>(this.url);
  }
}
