import { ComponentFixture, TestBed } from '@angular/core/testing';

import { settingboardComponent } from './settingboard.component';

describe('SignupComponent', () => {
  let component: settingboardComponent;
  let fixture: ComponentFixture<settingboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ settingboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(settingboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
