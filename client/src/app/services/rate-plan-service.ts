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
  createRatePlan(plan: Omit<RatePlan, 'id'>): Observable<RatePlan> {
  return this.http.post<RatePlan>(this.url, plan);
  }
  // PUT replaces the whole record, so send every field
  updateRatePlan(plan: RatePlan): Observable<RatePlan> {
    return this.http.put<RatePlan>(`${this.url}/${plan.id}`, plan);
  }
  deleteRatePlan(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
