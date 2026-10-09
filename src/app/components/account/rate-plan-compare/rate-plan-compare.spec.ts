import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RatePlanCompare } from './rate-plan-compare';

describe('RatePlanCompare', () => {
  let component: RatePlanCompare;
  let fixture: ComponentFixture<RatePlanCompare>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatePlanCompare],
    }).compileComponents();

    fixture = TestBed.createComponent(RatePlanCompare);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
