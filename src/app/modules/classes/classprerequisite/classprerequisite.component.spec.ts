import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassprerequisiteComponent } from './classprerequisite.component';

describe('ClassprerequisiteComponent', () => {
  let component: ClassprerequisiteComponent;
  let fixture: ComponentFixture<ClassprerequisiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassprerequisiteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassprerequisiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
