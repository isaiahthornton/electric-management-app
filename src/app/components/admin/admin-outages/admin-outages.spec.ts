import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminOutages } from './admin-outages';

describe('AdminOutages', () => {
  let component: AdminOutages;
  let fixture: ComponentFixture<AdminOutages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminOutages],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminOutages);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
