import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsageHistory } from './usage-history';

describe('UsageHistory', () => {
  let component: UsageHistory;
  let fixture: ComponentFixture<UsageHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsageHistory],
    }).compileComponents();

    fixture = TestBed.createComponent(UsageHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
