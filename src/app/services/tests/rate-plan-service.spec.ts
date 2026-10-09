import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RatePlanService } from '../rate-plan-service';

describe('RatePlanService', () => {
  let service: RatePlanService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RatePlanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
