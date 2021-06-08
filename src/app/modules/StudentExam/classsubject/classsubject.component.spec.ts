import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClasssubjectComponent } from './classsubject.component';

describe('ClasssubjectComponent', () => {
  let component: ClasssubjectComponent;
  let fixture: ComponentFixture<ClasssubjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClasssubjectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClasssubjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
