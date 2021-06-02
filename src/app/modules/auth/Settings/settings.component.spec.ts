import { ComponentFixture, TestBed } from '@angular/core/testing';

import { settingsComponent } from './settings.component';

describe('SignupComponent', () => {
  let component: settingsComponent;
  let fixture: ComponentFixture<settingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ settingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(settingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
