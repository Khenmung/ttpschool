import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeesmanagementhomeComponent } from './feesmanagementhome.component';

describe('FeesmanagementhomeComponent', () => {
  let component: FeesmanagementhomeComponent;
  let fixture: ComponentFixture<FeesmanagementhomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeesmanagementhomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeesmanagementhomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
