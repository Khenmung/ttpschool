import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeetotalattendanceComponent } from './employeetotalattendance.component';

describe('EmployeetotalattendanceComponent', () => {
  let component: EmployeetotalattendanceComponent;
  let fixture: ComponentFixture<EmployeetotalattendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeetotalattendanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeetotalattendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
