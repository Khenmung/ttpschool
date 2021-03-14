import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeeHeaderComponent } from './feeheader.component';

describe('HeaderComponent', () => {
  let component: FeeHeaderComponent;
  let fixture: ComponentFixture<FeeHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeeHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeeHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
