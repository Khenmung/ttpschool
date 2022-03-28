import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationandexamComponent } from './evaluationandexam.component';

describe('EvaluationandexamComponent', () => {
  let component: EvaluationandexamComponent;
  let fixture: ComponentFixture<EvaluationandexamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EvaluationandexamComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluationandexamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
