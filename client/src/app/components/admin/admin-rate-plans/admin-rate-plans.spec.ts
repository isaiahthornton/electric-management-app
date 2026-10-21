import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AdminRatePlans } from './admin-rate-plans';

describe('AdminRatePlans', () => {
  let component: AdminRatePlans;
  let fixture: ComponentFixture<AdminRatePlans>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRatePlans],
      // A fake HTTP backend and an empty router, so the component can be created without the real API
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminRatePlans);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
