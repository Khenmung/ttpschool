import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodayCollectionComponent } from './today-collection.component';

describe('TodayCollectionComponent', () => {
  let component: TodayCollectionComponent;
  let fixture: ComponentFixture<TodayCollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TodayCollectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TodayCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
