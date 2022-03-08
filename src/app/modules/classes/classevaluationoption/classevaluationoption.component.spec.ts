import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassevaluationoptionComponent } from './classevaluationoption.component';

describe('ClassevaluationoptionComponent', () => {
  let component: ClassevaluationoptionComponent;
  let fixture: ComponentFixture<ClassevaluationoptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassevaluationoptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassevaluationoptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
