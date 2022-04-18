import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationresultComponent } from './evaluationresult.component';

describe('EvaluationresultComponent', () => {
  let component: EvaluationresultComponent;
  let fixture: ComponentFixture<EvaluationresultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EvaluationresultComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluationresultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
