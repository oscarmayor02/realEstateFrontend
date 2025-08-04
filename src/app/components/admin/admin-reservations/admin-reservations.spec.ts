import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminReservations } from './admin-reservations';

describe('AdminReservations', () => {
  let component: AdminReservations;
  let fixture: ComponentFixture<AdminReservations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminReservations]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminReservations);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
