import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BillService } from '../bill-service';
import { Bill } from '../../interfaces/bill';
import { API_URL } from '../../utils/api';

describe('BillService', () => {
  let service: BillService;
  let http: HttpTestingController;

  const bill = (overrides: Partial<Bill>): Bill => ({
    id: 1, customerId: 1, periodStart: '2026-09-01', periodEnd: '2026-09-30', dueDate: '2026-10-21',
    kwhUsed: 640, amountDue: 135.2, status: 'unpaid', energyCharge: 115.2, serviceCharge: 20, paidDate: null,
    ...overrides,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BillService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('payBill sends a PATCH that marks the bill paid', () => {
    service.payBill(5).subscribe();

    const req = http.expectOne(`${API_URL}/bills/5`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body.status).toBe('paid');
    expect(req.request.body.paidDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    req.flush(bill({ id: 5, status: 'paid' }));
  });

  it('marks unpaid bills past their due date as overdue when they load', () => {
    let bills: Bill[] = [];
    service.getBillsByCustomer(1).subscribe((b) => (bills = b));

    http.expectOne(() => true).flush([
      bill({ id: 1, dueDate: '2020-01-01' }), // long past due
      bill({ id: 2, dueDate: '2999-01-01' }), // not due yet
      bill({ id: 3, dueDate: '2020-01-01', status: 'paid' }), // paid, so never overdue
    ]);

    expect(bills.map((b) => b.status)).toEqual(['overdue', 'unpaid', 'paid']);
  });
});
