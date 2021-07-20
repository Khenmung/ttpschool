import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GradeComponentsComponent } from './grade-components.component';

describe('GradeComponentsComponent', () => {
  let component: GradeComponentsComponent;
  let fixture: ComponentFixture<GradeComponentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GradeComponentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GradeComponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
