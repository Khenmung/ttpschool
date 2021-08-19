import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultboardComponent } from './resultboard.component';

describe('ResultboardComponent', () => {
  let component: ResultboardComponent;
  let fixture: ComponentFixture<ResultboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResultboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
