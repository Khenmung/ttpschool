import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClasssubjectteacherdashboardComponent } from './classsubjectteacherdashboard.component';

describe('ClasssubjectdashboardComponent', () => {
  let component: ClasssubjectteacherdashboardComponent;
  let fixture: ComponentFixture<ClasssubjectteacherdashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClasssubjectteacherdashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClasssubjectteacherdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
