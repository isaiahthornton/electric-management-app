import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { OutageService } from '../outage-service';

describe('OutageService', () => {
  let service: OutageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OutageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
