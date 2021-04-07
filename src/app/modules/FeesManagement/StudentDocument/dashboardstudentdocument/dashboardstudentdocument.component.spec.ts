import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardstudentdocumentComponent } from './dashboardstudentdocument.component';

describe('DashboardstudentdocumentComponent', () => {
  let component: DashboardstudentdocumentComponent;
  let fixture: ComponentFixture<DashboardstudentdocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardstudentdocumentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardstudentdocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
