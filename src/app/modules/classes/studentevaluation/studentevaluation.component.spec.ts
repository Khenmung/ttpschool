import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentevaluationComponent } from './studentevaluation.component';

describe('StudentevaluationComponent', () => {
  let component: StudentevaluationComponent;
  let fixture: ComponentFixture<StudentevaluationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentevaluationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentevaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
