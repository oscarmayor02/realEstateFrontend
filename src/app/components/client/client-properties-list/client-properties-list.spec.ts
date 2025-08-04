import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPropertiesList } from './client-properties-list';

describe('ClientPropertiesList', () => {
  let component: ClientPropertiesList;
  let fixture: ComponentFixture<ClientPropertiesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientPropertiesList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientPropertiesList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
