import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminKpis, AuditEntry, UsageTrendPoint } from '../interfaces/admin-insight';
import { API_URL } from '../utils/api';

@Service()
export class AdminInsightService {
  private http = inject(HttpClient);
  private url = `${API_URL}/admin`;

  getKpis(): Observable<AdminKpis> {
    return this.http.get<AdminKpis>(`${this.url}/kpis`);
  }
  getUsageTrend(months = 12): Observable<UsageTrendPoint[]> {
    return this.http.get<UsageTrendPoint[]>(`${this.url}/usage-trend?months=${months}`);
  }
  getActivity(take = 50): Observable<AuditEntry[]> {
    return this.http.get<AuditEntry[]>(`${this.url}/activity?take=${take}`);
  }
}
