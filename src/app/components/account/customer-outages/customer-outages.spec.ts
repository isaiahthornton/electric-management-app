import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerOutages } from './customer-outages';

describe('CustomerOutages', () => {
  let component: CustomerOutages;
  let fixture: ComponentFixture<CustomerOutages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerOutages],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerOutages);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
