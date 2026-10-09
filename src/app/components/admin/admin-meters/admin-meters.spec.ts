import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AdminMeters } from './admin-meters';

describe('AdminMeters', () => {
  let component: AdminMeters;
  let fixture: ComponentFixture<AdminMeters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminMeters],
      // A fake HTTP backend and an empty router, so the component can be created without the real API
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminMeters);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
