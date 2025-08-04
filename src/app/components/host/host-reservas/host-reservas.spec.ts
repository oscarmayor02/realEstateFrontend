import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HostReservas } from './host-reservas';

describe('HostReservas', () => {
  let component: HostReservas;
  let fixture: ComponentFixture<HostReservas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostReservas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HostReservas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
