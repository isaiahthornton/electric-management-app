import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AdminActivity } from './admin-activity';
import { API_URL } from '../../../utils/api';

describe('AdminActivity', () => {
  let fixture: ComponentFixture<AdminActivity>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminActivity],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminActivity);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('shows what changed, old to new, and who did it', () => {
    http.expectOne(`${API_URL}/admin/activity?take=50`).flush([
      {
        id: 1,
        tableName: 'Outages',
        recordId: 4,
        columnName: 'Status',
        oldValue: 'Reported',
        newValue: 'InProgress',
        changedAt: '2026-10-21T09:00:00',
        changedBy: 'support@thornenergy.com',
      },
    ]);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Outage #4');
    expect(text).toContain('Reported → In Progress');
    expect(text).toContain('support@thornenergy.com');
  });
});
