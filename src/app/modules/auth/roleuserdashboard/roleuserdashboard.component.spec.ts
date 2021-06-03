import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleuserdashboardComponent } from './roleuserdashboard.component';

describe('ApproleuserdashboardComponent', () => {
  let component: RoleuserdashboardComponent;
  let fixture: ComponentFixture<RoleuserdashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoleuserdashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleuserdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
