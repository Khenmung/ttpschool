import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentclassdashboardComponent } from './studentclassdashboard.component';

describe('StudentclassdashboardComponent', () => {
  let component: StudentclassdashboardComponent;
  let fixture: ComponentFixture<StudentclassdashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentclassdashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentclassdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
