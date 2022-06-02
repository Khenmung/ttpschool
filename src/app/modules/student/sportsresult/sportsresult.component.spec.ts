import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SportsResultComponent } from './sportsresult.component';

describe('SportsResultComponent', () => {
  let component: SportsResultComponent;
  let fixture: ComponentFixture<SportsResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SportsResultComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SportsResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
