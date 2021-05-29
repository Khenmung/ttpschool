import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllNewsdashboardComponent } from './allnewsdashboard.component';

describe('NewsdashboardComponent', () => {
  let component: AllNewsdashboardComponent;
  let fixture: ComponentFixture<AllNewsdashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllNewsdashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllNewsdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
