import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminProperties } from './admin-properties';

describe('AdminProperties', () => {
  let component: AdminProperties;
  let fixture: ComponentFixture<AdminProperties>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProperties]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminProperties);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
