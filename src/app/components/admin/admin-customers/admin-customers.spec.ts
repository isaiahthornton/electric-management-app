import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AdminCustomers } from './admin-customers';

describe('AdminCustomers', () => {
  let component: AdminCustomers;
  let fixture: ComponentFixture<AdminCustomers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCustomers],
      // A fake HTTP backend and an empty router, so the component can be created without the real API
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminCustomers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
