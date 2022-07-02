import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatadumpComponent } from './datadump.component';

describe('DatadumpComponent', () => {
  let component: DatadumpComponent;
  let fixture: ComponentFixture<DatadumpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatadumpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatadumpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
