import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AdminOutageMap } from './admin-outage-map';
import { API_URL } from '../../../utils/api';

describe('AdminOutageMap', () => {
  let fixture: ComponentFixture<AdminOutageMap>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminOutageMap],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminOutageMap);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('builds one marker per outage with the customer name and status', () => {
    http.expectOne(`${API_URL}/outages/map`).flush([
      {
        outageId: 1,
        customerId: 1,
        customerName: 'Jane Doe',
        address: '12 Maple Ave',
        description: 'Power out',
        timeReported: '2026-10-06T08:15:00',
        timeResolved: null,
        status: 'in_progress',
        latitude: 40.27,
        longitude: -74.53,
      },
    ]);

    const markers = fixture.componentInstance['markers']();
    expect(markers.length).toBe(1);
    expect(markers[0].title).toBe('Jane Doe');
    expect(markers[0].status).toBe('in_progress');
    expect(markers[0].lines).toContain('Status: In Progress');
  });
});
