import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamslotComponent } from './examslot.component';

describe('ExamslotComponent', () => {
  let component: ExamslotComponent;
  let fixture: ComponentFixture<ExamslotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExamslotComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExamslotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
