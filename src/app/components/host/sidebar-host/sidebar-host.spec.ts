import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarHost } from './sidebar-host';

describe('SidebarHost', () => {
  let component: SidebarHost;
  let fixture: ComponentFixture<SidebarHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarHost]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarHost);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
