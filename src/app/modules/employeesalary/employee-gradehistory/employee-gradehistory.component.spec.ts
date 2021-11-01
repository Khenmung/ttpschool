import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeGradehistoryComponent } from './employee-gradehistory.component';

describe('EmployeeSalaryComponent', () => {
  let component: EmployeeGradehistoryComponent;
  let fixture: ComponentFixture<EmployeeGradehistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeGradehistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeGradehistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
