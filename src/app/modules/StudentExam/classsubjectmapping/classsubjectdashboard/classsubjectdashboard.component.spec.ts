import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClasssubjectdashboardComponent } from './classsubjectdashboard.component';

describe('ClasssubjectdashboardComponent', () => {
  let component: ClasssubjectdashboardComponent;
  let fixture: ComponentFixture<ClasssubjectdashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClasssubjectdashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClasssubjectdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
