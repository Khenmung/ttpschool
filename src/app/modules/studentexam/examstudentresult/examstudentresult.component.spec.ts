import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamstudentresultComponent } from './examstudentresult.component';

describe('ExamstudentresultComponent', () => {
  let component: ExamstudentresultComponent;
  let fixture: ComponentFixture<ExamstudentresultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExamstudentresultComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExamstudentresultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
