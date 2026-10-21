import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AdminInsightService } from '../admin-insight-service';
import { API_URL } from '../../utils/api';

describe('AdminInsightService', () => {
  let service: AdminInsightService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AdminInsightService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('gets the KPIs', () => {
    service.getKpis().subscribe();
    http.expectOne(`${API_URL}/admin/kpis`).flush({});
  });

  it('asks for the requested number of months', () => {
    service.getUsageTrend(6).subscribe();
    http.expectOne(`${API_URL}/admin/usage-trend?months=6`).flush([]);
  });

  it('asks for the requested number of activity rows', () => {
    service.getActivity(20).subscribe();
    http.expectOne(`${API_URL}/admin/activity?take=20`).flush([]);
  });
});
