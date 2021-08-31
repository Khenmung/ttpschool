import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClassSubjectboardComponent } from './classsubjectboard.component';

describe('SubjectdashboardComponent', () => {
  let component: ClassSubjectboardComponent;
  let fixture: ComponentFixture<ClassSubjectboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassSubjectboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassSubjectboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
