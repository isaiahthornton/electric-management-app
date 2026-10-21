import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AccountLayout } from './account-layout';

describe('AccountLayout', () => {
  let component: AccountLayout;
  let fixture: ComponentFixture<AccountLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountLayout],
      // A fake HTTP backend and an empty router, so the component can be created without the real API
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
