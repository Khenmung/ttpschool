import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GradeLeaveComponent } from './grade-leave.component';

describe('GradeLeaveComponent', () => {
  let component: GradeLeaveComponent;
  let fixture: ComponentFixture<GradeLeaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GradeLeaveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GradeLeaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
