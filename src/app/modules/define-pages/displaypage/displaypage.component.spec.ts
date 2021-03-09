import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplaypageComponent } from './displaypage.component';

describe('DisplaypageComponent', () => {
  let component: DisplaypageComponent;
  let fixture: ComponentFixture<DisplaypageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisplaypageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplaypageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
