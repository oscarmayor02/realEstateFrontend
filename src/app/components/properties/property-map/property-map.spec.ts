import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyMap } from './property-map';

describe('PropertyMap', () => {
  let component: PropertyMap;
  let fixture: ComponentFixture<PropertyMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyMap]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyMap);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
