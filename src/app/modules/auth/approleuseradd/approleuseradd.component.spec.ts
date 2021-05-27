import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproleuseraddComponent } from './approleuseradd.component';

describe('ApproleuseraddComponent', () => {
  let component: ApproleuseraddComponent;
  let fixture: ComponentFixture<ApproleuseraddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproleuseraddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproleuseraddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
