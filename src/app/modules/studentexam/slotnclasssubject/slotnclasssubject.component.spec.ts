import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotnclasssubjectComponent } from './slotnclasssubject.component';

describe('SlotnclasssubjectComponent', () => {
  let component: SlotnclasssubjectComponent;
  let fixture: ComponentFixture<SlotnclasssubjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SlotnclasssubjectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SlotnclasssubjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
