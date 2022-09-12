import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionbankComponent } from './questionbank.component';

describe('QuesitonbankComponent', () => {
  let component: QuestionbankComponent;
  let fixture: ComponentFixture<QuestionbankComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionbankComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionbankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
