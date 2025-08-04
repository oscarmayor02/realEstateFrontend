import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HostProperties } from './host-properties';

describe('HostProperties', () => {
  let component: HostProperties;
  let fixture: ComponentFixture<HostProperties>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostProperties]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HostProperties);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
