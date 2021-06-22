import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectdashboardComponent } from './subjectdashboard.component';

describe('SubjectdashboardComponent', () => {
  let component: SubjectdashboardComponent;
  let fixture: ComponentFixture<SubjectdashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubjectdashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubjectdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
