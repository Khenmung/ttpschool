import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgreportcolumnsComponent } from './orgreportcolumns.component';

describe('OrgreportcolumnsComponent', () => {
  let component: OrgreportcolumnsComponent;
  let fixture: ComponentFixture<OrgreportcolumnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgreportcolumnsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgreportcolumnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
