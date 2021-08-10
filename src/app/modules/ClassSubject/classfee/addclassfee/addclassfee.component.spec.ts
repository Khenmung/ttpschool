import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddclassfeeComponent } from './addclassfee.component';

describe('AddclassfeeComponent', () => {
  let component: AddclassfeeComponent;
  let fixture: ComponentFixture<AddclassfeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddclassfeeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddclassfeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
