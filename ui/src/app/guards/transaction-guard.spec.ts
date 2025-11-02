import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { transactionGuard } from './transaction-guard';

describe('transactionGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => transactionGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
