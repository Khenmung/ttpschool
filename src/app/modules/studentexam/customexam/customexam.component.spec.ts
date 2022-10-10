import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomexamComponent } from './customexam.component';

describe('CustomexamComponent', () => {
  let component: CustomexamComponent;
  let fixture: ComponentFixture<CustomexamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomexamComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomexamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
