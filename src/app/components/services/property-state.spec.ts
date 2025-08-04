import { TestBed } from '@angular/core/testing';

import { PropertyState } from './property-state';

describe('PropertyState', () => {
  let service: PropertyState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PropertyState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
