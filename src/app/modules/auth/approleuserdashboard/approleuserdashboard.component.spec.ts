import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproleuserdashboardComponent } from './approleuserdashboard.component';

describe('ApproleuserdashboardComponent', () => {
  let component: ApproleuserdashboardComponent;
  let fixture: ComponentFixture<ApproleuserdashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproleuserdashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproleuserdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
