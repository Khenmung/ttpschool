import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamstudentsubjectresultComponent } from './examstudentsubjectresult.component';

describe('ExamstudentsubjectresultComponent', () => {
  let component: ExamstudentsubjectresultComponent;
  let fixture: ComponentFixture<ExamstudentsubjectresultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExamstudentsubjectresultComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExamstudentsubjectresultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
