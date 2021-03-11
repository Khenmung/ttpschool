import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardstudentComponent } from './dashboardstudent.component';

describe('DashboardstudentComponent', () => {
  let component: DashboardstudentComponent;
  let fixture: ComponentFixture<DashboardstudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardstudentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardstudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
