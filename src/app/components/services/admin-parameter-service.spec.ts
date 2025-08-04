import { TestBed } from '@angular/core/testing';

import { AdminParameterService } from './admin-parameter-service';

describe('AdminParameterService', () => {
  let service: AdminParameterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminParameterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
