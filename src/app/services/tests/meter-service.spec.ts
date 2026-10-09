import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MeterService } from '../meter-service';

describe('MeterService', () => {
  let service: MeterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MeterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
