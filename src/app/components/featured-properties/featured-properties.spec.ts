import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedProperties } from './featured-properties';

describe('FeaturedProperties', () => {
  let component: FeaturedProperties;
  let fixture: ComponentFixture<FeaturedProperties>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedProperties]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeaturedProperties);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
