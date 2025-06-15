import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppBanner } from './app-banner';

describe('AppBanner', () => {
  let component: AppBanner;
  let fixture: ComponentFixture<AppBanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppBanner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppBanner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
