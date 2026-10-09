import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AdminOutages } from './admin-outages';

describe('AdminOutages', () => {
  let component: AdminOutages;
  let fixture: ComponentFixture<AdminOutages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminOutages],
      // A fake HTTP backend and an empty router, so the component can be created without the real API
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminOutages);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
