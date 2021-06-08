import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleAppdashboardComponent } from './RoleAppdashboard.component';

describe('ApproledashboardComponent', () => {
  let component: RoleAppdashboardComponent;
  let fixture: ComponentFixture<RoleAppdashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoleAppdashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleAppdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
