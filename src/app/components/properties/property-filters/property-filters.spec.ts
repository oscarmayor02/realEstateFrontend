import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyFilters } from './property-filters';

describe('PropertyFilters', () => {
  let component: PropertyFilters;
  let fixture: ComponentFixture<PropertyFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyFilters]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyFilters);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
