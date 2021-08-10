import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClasssubjectteacherComponent } from './classsubjectteacher.component';

describe('ClasssubjectteacherComponent', () => {
  let component: ClasssubjectteacherComponent;
  let fixture: ComponentFixture<ClasssubjectteacherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClasssubjectteacherComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClasssubjectteacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
