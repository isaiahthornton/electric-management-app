import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RatePlanCompare } from './rate-plan-compare';

describe('RatePlanCompare', () => {
  let component: RatePlanCompare;
  let fixture: ComponentFixture<RatePlanCompare>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatePlanCompare],
      // A fake HTTP backend and an empty router, so the component can be created without the real API
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(RatePlanCompare);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
