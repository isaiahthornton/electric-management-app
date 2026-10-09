import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminRatePlans } from './admin-rate-plans';

describe('AdminRatePlans', () => {
  let component: AdminRatePlans;
  let fixture: ComponentFixture<AdminRatePlans>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRatePlans],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminRatePlans);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
