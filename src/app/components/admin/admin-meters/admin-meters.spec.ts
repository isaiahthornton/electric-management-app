import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminMeters } from './admin-meters';

describe('AdminMeters', () => {
  let component: AdminMeters;
  let fixture: ComponentFixture<AdminMeters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminMeters],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminMeters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
