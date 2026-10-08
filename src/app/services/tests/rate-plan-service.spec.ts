import { TestBed } from '@angular/core/testing';
import { RatePlanService } from '../rate-plan-service';

describe('RatePlanService', () => {
  let service: RatePlanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RatePlanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
