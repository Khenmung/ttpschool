import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationClassSubjectMapComponent } from './EvaluationClassSubjectMap.component';

describe('EvaluationComponent', () => {
  let component: EvaluationClassSubjectMapComponent;
  let fixture: ComponentFixture<EvaluationClassSubjectMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EvaluationClassSubjectMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluationClassSubjectMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
